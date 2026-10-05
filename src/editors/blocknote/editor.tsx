import "@blocknote/shadcn/style.css";
import "./blocknote.css";
import { BlockNoteEditor, filterSuggestionItems } from "@blocknote/core";
import { CommentsExtension } from "@blocknote/core/comments";
import {
	CURRENT_VERSION_ID,
	createInMemoryVersioningAdapter,
	createInMemoryVersioningEndpoints,
	VersioningExtension,
	type VersionSnapshot,
} from "@blocknote/core/extensions";
import {
	BlockNoteViewEditor,
	FormattingToolbar,
	FormattingToolbarController,
	SuggestionMenuController,
	ThreadsSidebar,
	useBlockNoteEditor,
	useComponentsContext,
	useCreateBlockNote,
	useEditorFocus,
	useExtensionState,
	useSelectedBlocks,
	VersioningSidebar,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { AtSign, Braces, Redo2, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { EditorProps } from "@/editors/types";
import { fileToDataUrl } from "@/lib/image";
import { normalizeCodeBlocks } from "./code-languages";
import { COMMENT_USER, createThreadStore, resolveUsers } from "./comments";
import { customLabels, dictionaryFor, type UiLanguage } from "./i18n";
import { blocksToHtml, blocksToMarkdown, markdownToBlocks } from "./markdown";
import {
	mentionItems,
	openMenu,
	slashItems,
	toolbarItems,
	variableItems,
} from "./menus";
import { meta } from "./meta";
import {
	type AppEditor,
	type AppPartialBlock,
	baseEditorOptions,
} from "./schema";
import { appShadCNComponents } from "./shadcn-overrides";
import { type Panel, ToolsBar } from "./tools";

/** Images become data URLs (no upload server); >1 MB is rejected with a toast. */
async function uploadFile(file: File): Promise<string> {
	try {
		return await fileToDataUrl(file);
	} catch (error) {
		toast.error(error instanceof Error ? error.message : "Upload failed");
		throw error;
	}
}

/** Extra buttons for the fixed toolbar, built with BlockNote's own toolbar button slot. */
function ExtraToolbarButtons({ language }: { language: UiLanguage }) {
	const Components = useComponentsContext();
	const editor = useBlockNoteEditor() as unknown as AppEditor;
	if (!Components) return null;
	const Button = Components.FormattingToolbar.Button;
	const labels = customLabels(language);
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
				label={labels.variable.title}
				mainTooltip={labels.variable.title}
				secondaryTooltip="{{"
				icon={<Braces size={16} />}
				onClick={() => openMenu(editor, "{{")}
			/>
			<Button
				label={labels.mention.title}
				mainTooltip={labels.mention.title}
				secondaryTooltip="@"
				icon={<AtSign size={16} />}
				onClick={() => openMenu(editor, "@")}
			/>
		</>
	);
}

/** Live readout of the selection and focus events (docs: "Events", "Cursor & Selections"). */
function StatusBar() {
	const editor = useBlockNoteEditor();
	const selected = useSelectedBlocks(editor);
	const focused = useEditorFocus({ includeEditorUI: true }, editor);
	const types = [...new Set(selected.map((block) => block.type))].join(", ");
	return (
		<div
			className="flex flex-wrap gap-x-4 border-t px-4 py-2 font-label text-xs text-muted-foreground"
			data-testid="blocknote-status"
		>
			<span>
				Selection: {selected.length} block{selected.length === 1 ? "" : "s"}
				{types && ` (${types})`}
			</span>
			<span>{focused ? "Editor focused" : "Editor not focused"}</span>
			<span>Commenting as {COMMENT_USER.name}</span>
		</div>
	);
}

function CommentsPanel() {
	const [filter, setFilter] = useState<"open" | "resolved" | "all">("open");
	const [sort, setSort] = useState<"position" | "recent-activity" | "oldest">(
		"position",
	);
	return (
		<section
			className="border-t px-4 py-3"
			data-testid="blocknote-threads-sidebar"
		>
			<div className="mb-2 flex flex-wrap items-center gap-3 text-sm">
				<h2 className="font-label font-semibold">Comments</h2>
				<label className="flex items-center gap-1 text-muted-foreground">
					Show
					<select
						className="rounded border bg-background px-1 py-0.5"
						value={filter}
						onChange={(event) => setFilter(event.target.value as typeof filter)}
					>
						<option value="open">Open</option>
						<option value="resolved">Resolved</option>
						<option value="all">All</option>
					</select>
				</label>
				<label className="flex items-center gap-1 text-muted-foreground">
					Sort
					<select
						className="rounded border bg-background px-1 py-0.5"
						value={sort}
						onChange={(event) => setSort(event.target.value as typeof sort)}
					>
						<option value="position">Position</option>
						<option value="recent-activity">Recent activity</option>
						<option value="oldest">Oldest</option>
					</select>
				</label>
			</div>
			<p className="mb-2 text-xs text-muted-foreground">
				Select text and press the comment button in the toolbar. Threads stay
				for this visit only.
			</p>
			<ThreadsSidebar filter={filter} sort={sort} />
		</section>
	);
}

function HistoryPanel({ onClose }: { onClose: () => void }) {
	return (
		<section
			className="border-t px-4 py-3"
			data-testid="blocknote-versioning-sidebar"
		>
			<p className="mb-2 text-xs text-muted-foreground">
				Save snapshots, preview, rename and restore them. Kept in memory for
				this visit.
			</p>
			<VersioningSidebar filter="all" onClose={onClose} />
		</section>
	);
}

type Endpoints = ReturnType<typeof createInMemoryVersioningEndpoints>;

/**
 * BlockNote's in-memory versioning adapter, but with the snapshot store created once
 * per page so snapshots survive the editor being re-created (UI language switch).
 */
function versioning(endpoints: Endpoints) {
	return VersioningExtension((editor) => ({
		...createInMemoryVersioningAdapter(editor),
		endpoints: {
			...endpoints,
			list: async () => {
				const current: VersionSnapshot = {
					id: CURRENT_VERSION_ID,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				};
				return [current, ...(await endpoints.list())];
			},
		},
	}));
}

function initialBlocks(
	storedJson: unknown,
	markdown: string,
): AppPartialBlock[] | undefined {
	if (Array.isArray(storedJson) && storedJson.length > 0)
		return normalizeCodeBlocks(storedJson as AppPartialBlock[]);
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
	const [readOnly, setReadOnly] = useState(false);
	const [panel, setPanel] = useState<Panel>(null);
	const documentRef = useRef<AppPartialBlock[] | undefined>(undefined);
	if (documentRef.current === undefined)
		documentRef.current = initialBlocks(storedJson, initialMarkdown);
	// Created once, so threads and snapshots outlive editor re-creation.
	const [threadStore] = useState(createThreadStore);
	const [snapshots] = useState(createInMemoryVersioningEndpoints);

	// Changing the UI language re-creates the editor (the dictionary is a creation
	// option); the current document is carried over through `documentRef`.
	const editor = useCreateBlockNote(
		{
			...baseEditorOptions,
			initialContent: documentRef.current,
			dictionary: dictionaryFor(language),
			uploadFile,
			extensions: [
				...baseEditorOptions.extensions,
				CommentsExtension({ threadStore, resolveUsers }),
				versioning(snapshots),
			],
		},
		[language],
	) as AppEditor;

	const { previewedSnapshotId } = useExtensionState(VersioningExtension, {
		editor,
	});
	const previewing = previewedSnapshotId !== undefined;

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

	const items = toolbarItems(editor);

	return (
		<div className="flex min-h-[60vh] flex-col rounded-xl border bg-card font-sans">
			<BlockNoteView
				editor={editor}
				editable={!readOnly && !previewing}
				theme="light"
				renderEditor={false}
				slashMenu={false}
				formattingToolbar={false}
				shadCNComponents={appShadCNComponents}
				className="bml-blocknote flex flex-1 flex-col"
				data-testid="blocknote-editor"
			>
				<ToolsBar
					editor={editor}
					language={language}
					onLanguage={setLanguage}
					readOnly={readOnly}
					onReadOnly={setReadOnly}
					panel={panel}
					onPanel={setPanel}
				/>
				<div className="sticky top-16 z-20 rounded-t-xl border-b bg-card/95 px-2 py-1.5 backdrop-blur">
					<div className="min-w-0" data-testid="blocknote-fixed-toolbar">
						<FormattingToolbar>
							{items}
							<ExtraToolbarButtons language={language} />
						</FormattingToolbar>
					</div>
				</div>
				{previewing && (
					<p className="border-b bg-muted px-4 py-2 text-sm">
						Previewing a saved version (read-only). Pick "Current version" in
						History to go back.
					</p>
				)}
				<div className="flex-1 py-4">
					<BlockNoteViewEditor />
				</div>
				<FormattingToolbarController
					formattingToolbar={() => (
						<FormattingToolbar>{items}</FormattingToolbar>
					)}
				/>
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
				{panel === "comments" && <CommentsPanel />}
				{panel === "history" && <HistoryPanel onClose={() => setPanel(null)} />}
				<StatusBar />
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
