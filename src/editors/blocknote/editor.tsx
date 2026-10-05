import "@blocknote/shadcn/style.css";
import "./blocknote.css";
import { BlockNoteEditor, filterSuggestionItems } from "@blocknote/core";
import { SuggestionMenu } from "@blocknote/core/extensions";
import {
	BlockNoteViewEditor,
	type DefaultReactSuggestionItem,
	FormattingToolbar,
	getDefaultReactSlashMenuItems,
	getFormattingToolbarItems,
	SuggestionMenuController,
	useBlockNoteEditor,
	useComponentsContext,
	useCreateBlockNote,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { AtSign, Braces, Languages, Redo2, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { USERS } from "@/data/users";
import { VARIABLES } from "@/data/variables";
import type { EditorProps } from "@/editors/types";
import { fileToDataUrl } from "@/lib/image";
import { customLabels, dictionaries, type UiLanguage } from "./i18n";
import { blocksToHtml, blocksToMarkdown, markdownToBlocks } from "./markdown";
import { meta } from "./meta";
import {
	type AppEditor,
	type AppPartialBlock,
	baseEditorOptions,
} from "./schema";
import { appShadCNComponents } from "./shadcn-overrides";

/** Images become data URLs (no upload server); >1 MB is rejected with a toast. */
async function uploadFile(file: File): Promise<string> {
	try {
		return await fileToDataUrl(file);
	} catch (error) {
		toast.error(error instanceof Error ? error.message : "Upload failed");
		throw error;
	}
}

function openMenu(editor: AppEditor, trigger: string) {
	editor.getExtension(SuggestionMenu)?.openSuggestionMenu(trigger, {
		deleteTriggerCharacter: true,
		ignoreQueryLength: true,
	});
}

function initials(name: string): string {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.slice(0, 2);
}

function slashItems(
	editor: AppEditor,
	language: UiLanguage,
): DefaultReactSuggestionItem[] {
	const labels = customLabels[language];
	return [
		...getDefaultReactSlashMenuItems(editor),
		{
			...labels.variable,
			group: labels.group,
			aliases: ["variable", "var", "template", "{{", "ตัวแปร"],
			icon: <Braces size={18} />,
			onItemClick: () => openMenu(editor, "{{"),
		},
		{
			...labels.mention,
			group: labels.group,
			aliases: ["mention", "person", "user", "@", "กล่าวถึง"],
			icon: <AtSign size={18} />,
			onItemClick: () => openMenu(editor, "@"),
		},
	];
}

function variableItems(editor: AppEditor): DefaultReactSuggestionItem[] {
	return VARIABLES.map((variable) => ({
		title: variable.label,
		subtext: `{{${variable.name}}} · ${variable.sample}`,
		aliases: [variable.name],
		icon: <Braces size={16} />,
		onItemClick: () =>
			editor.insertInlineContent([
				{ type: "variable", props: { name: variable.name } },
				" ",
			]),
	}));
}

function mentionItems(editor: AppEditor): DefaultReactSuggestionItem[] {
	return USERS.map((user) => ({
		title: user.name,
		subtext: user.role,
		aliases: [user.id],
		icon: (
			<span className="flex size-6 items-center justify-center rounded-full bg-accent font-label text-[10px] font-semibold text-accent-foreground">
				{initials(user.name)}
			</span>
		),
		onItemClick: () =>
			editor.insertInlineContent([
				{ type: "mention", props: { id: user.id, label: user.name } },
				" ",
			]),
	}));
}

/** Extra buttons for the fixed toolbar, built with BlockNote's own toolbar button slot. */
function ExtraToolbarButtons({ language }: { language: UiLanguage }) {
	const Components = useComponentsContext();
	const editor = useBlockNoteEditor() as unknown as AppEditor;
	if (!Components) return null;
	const Button = Components.FormattingToolbar.Button;
	return (
		<>
			<Button
				label="Undo"
				mainTooltip="Undo"
				secondaryTooltip="Mod+Z"
				icon={<Undo2 size={16} />}
				onClick={() => editor.undo()}
			/>
			<Button
				label="Redo"
				mainTooltip="Redo"
				secondaryTooltip="Mod+Shift+Z"
				icon={<Redo2 size={16} />}
				onClick={() => editor.redo()}
			/>
			<Button
				label={customLabels[language].variable.title}
				mainTooltip={customLabels[language].variable.title}
				secondaryTooltip="{{"
				icon={<Braces size={16} />}
				onClick={() => openMenu(editor, "{{")}
			/>
			<Button
				label={customLabels[language].mention.title}
				mainTooltip={customLabels[language].mention.title}
				secondaryTooltip="@"
				icon={<AtSign size={16} />}
				onClick={() => openMenu(editor, "@")}
			/>
		</>
	);
}

function initialBlocks(
	storedJson: unknown,
	markdown: string,
): AppPartialBlock[] | undefined {
	if (Array.isArray(storedJson) && storedJson.length > 0)
		return storedJson as AppPartialBlock[];
	// A throwaway headless editor (never mounted) parses markdown with our schema, so the
	// real editor starts with the content instead of an undoable replaceBlocks().
	const parser = BlockNoteEditor.create(baseEditorOptions) as AppEditor;
	const blocks = markdownToBlocks(parser, markdown);
	return blocks.length > 0 ? blocks : undefined;
}

export default function BlockNoteEditorView({
	initialMarkdown,
	storedJson,
	onChange,
}: EditorProps) {
	const [language, setLanguage] = useState<UiLanguage>("en");
	const documentRef = useRef<AppPartialBlock[] | undefined>(undefined);
	if (documentRef.current === undefined)
		documentRef.current = initialBlocks(storedJson, initialMarkdown);

	// Changing the UI language re-creates the editor (the dictionary is a creation
	// option); the current document is carried over through `documentRef`.
	const editor = useCreateBlockNote(
		{
			...baseEditorOptions,
			initialContent: documentRef.current,
			dictionary: dictionaries[language],
			uploadFile,
			tables: {
				splitCells: true,
				cellBackgroundColor: true,
				cellTextColor: true,
				headers: true,
			},
		},
		[language],
	) as AppEditor;

	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;

	useEffect(() => {
		// Exporting renders our React inline content with `flushSync`, which React refuses
		// to do inside an effect / commit. Serialize on a fresh task, coalescing bursts.
		let timer: ReturnType<typeof setTimeout> | undefined;
		const emit = () => {
			const json = editor.document;
			documentRef.current = json;
			onChangeRef.current({
				json,
				html: blocksToHtml(editor, json),
				markdown: blocksToMarkdown(editor, json),
			});
		};
		const schedule = () => {
			documentRef.current = editor.document;
			clearTimeout(timer);
			timer = setTimeout(emit, 0);
		};
		schedule();
		const unsubscribe = editor.onChange(schedule);
		return () => {
			clearTimeout(timer);
			unsubscribe();
		};
	}, [editor]);

	return (
		<div className="flex min-h-[60vh] flex-col rounded-xl border bg-card font-sans">
			<BlockNoteView
				editor={editor}
				theme="light"
				renderEditor={false}
				slashMenu={false}
				shadCNComponents={appShadCNComponents}
				className="bml-blocknote flex flex-1 flex-col"
				data-testid="blocknote-editor"
			>
				<div className="sticky top-16 z-20 flex items-start gap-2 rounded-t-xl border-b bg-card/95 px-2 py-1.5 backdrop-blur">
					<div className="min-w-0 flex-1" data-testid="blocknote-fixed-toolbar">
						<FormattingToolbar>
							{getFormattingToolbarItems()}
							<ExtraToolbarButtons language={language} />
						</FormattingToolbar>
					</div>
					<Button
						variant="ghost"
						size="sm"
						className="mt-1 shrink-0 font-label"
						onClick={() =>
							setLanguage((current) => (current === "en" ? "th" : "en"))
						}
						data-testid="blocknote-language"
						title="Switch BlockNote UI dictionary"
					>
						<Languages /> {language === "en" ? "UI: EN" : "UI: ไทย"}
					</Button>
				</div>
				<div className="flex-1 py-4">
					<BlockNoteViewEditor />
				</div>
				<SuggestionMenuController
					triggerCharacter="/"
					getItems={async (query) =>
						filterSuggestionItems(slashItems(editor, language), query)
					}
				/>
				<SuggestionMenuController
					triggerCharacter="@"
					getItems={async (query) =>
						filterSuggestionItems(mentionItems(editor), query)
					}
				/>
				<SuggestionMenuController
					triggerCharacter="{{"
					getItems={async (query) =>
						filterSuggestionItems(variableItems(editor), query)
					}
				/>
			</BlockNoteView>
			<details className="border-t px-4 py-3 text-sm">
				<summary className="cursor-pointer font-label font-semibold text-primary-text">
					BlockNote showcase
				</summary>
				<ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
					{meta.showcase.map((item) => (
						<li key={item}>{item}</li>
					))}
				</ul>
			</details>
		</div>
	);
}
