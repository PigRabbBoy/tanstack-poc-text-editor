import { DragonExtension } from "@lexical/dragon";
import { HashtagExtension } from "@lexical/hashtag";
import { createHeadlessEditor } from "@lexical/headless";
import { HistoryExtension } from "@lexical/history";
import { $generateHtmlFromNodes } from "@lexical/html";
import { CheckListExtension, ListExtension } from "@lexical/list";
import { OverflowExtension } from "@lexical/overflow";
import { PlainTextExtension } from "@lexical/plain-text";
import { CharacterLimitPlugin } from "@lexical/react/LexicalCharacterLimitPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer";
import { RichTextExtension } from "@lexical/rich-text";
import { TailwindExtension } from "@lexical/tailwind";
import {
	$createParagraphNode,
	$createTextNode,
	$getRoot,
	defineExtension,
} from "lexical";
import { FlaskConical } from "lucide-react";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { CodeExtension } from "@/editors/lexical/components/editor/extensions/code";
import { EmojiExtension } from "@/editors/lexical/components/editor/extensions/emoji";
import { LinkExtension } from "@/editors/lexical/components/editor/extensions/link";
import { MentionExtension } from "@/editors/lexical/components/editor/extensions/mention";
import {
	ChatInput,
	ChatInputSubmit,
} from "@/editors/lexical/components/editor/plugins/chat/chat-input-plugin";
import { ChatMessage } from "@/editors/lexical/components/editor/plugins/chat/chat-message-plugin";
import { CommentsPanel } from "@/editors/lexical/components/editor/plugins/floating/comment-plugin";
import { TableOfContentsPlugin } from "@/editors/lexical/components/editor/plugins/table-of-contents-plugin";
import { chatMessageTheme } from "@/editors/lexical/components/editor/theme";
import {
	PasteLogPlugin,
	TreeViewPlugin,
	TypingPerfPlugin,
} from "@/editors/lexical/components/playground/dev-tools";
import { TestRecorderPlugin } from "@/editors/lexical/components/playground/test-recorder";
import { Button } from "@/editors/lexical/ui/button";
import { InputGroupAddon } from "@/editors/lexical/ui/input-group";
import { FuzzDemo, LegacyComposerDemo, PagesDemo } from "./lab-demos";
import { $exportMarkdown } from "./markdown";
import { exportMdastMarkdown } from "./mdast";
import { type LabSettings, useLabSettings } from "./settings";
import { VariableExtension } from "./variable-node";

function Toggle({
	setting,
	label,
	hint,
}: {
	setting: {
		[K in keyof LabSettings]: LabSettings[K] extends boolean ? K : never;
	}[keyof LabSettings];
	label: string;
	hint?: string;
}) {
	const { settings, update } = useLabSettings();
	return (
		<label className="flex items-start gap-2 text-sm" title={hint}>
			<input
				type="checkbox"
				className="mt-1 size-3.5 accent-primary"
				checked={settings[setting]}
				onChange={(event) => update(setting, event.target.checked)}
				data-testid={`setting-${setting}`}
			/>
			<span>
				{label}
				{hint && (
					<span className="block text-xs text-muted-foreground">{hint}</span>
				)}
			</span>
		</label>
	);
}

function Choice<K extends keyof LabSettings>({
	setting,
	label,
	options,
}: {
	setting: K;
	label: string;
	options: { value: LabSettings[K]; label: string }[];
}) {
	const { settings, update } = useLabSettings();
	return (
		<label className="flex flex-col gap-1 text-sm">
			{label}
			<select
				className="h-7 rounded-md border bg-background px-1.5 text-sm"
				value={String(settings[setting])}
				data-testid={`setting-${setting}`}
				onChange={(event) => {
					const option = options.find(
						(candidate) => String(candidate.value) === event.target.value,
					);
					if (option) update(setting, option.value);
				}}
			>
				{options.map((option) => (
					<option key={String(option.value)} value={String(option.value)}>
						{option.label}
					</option>
				))}
			</select>
		</label>
	);
}

function NumberSetting({
	setting,
	label,
}: {
	setting: "maxLengthValue" | "charLimitValue";
	label: string;
}) {
	const { settings, update } = useLabSettings();
	return (
		<label className="flex items-center gap-2 text-xs text-muted-foreground">
			{label}
			<input
				type="number"
				min={1}
				className="h-6 w-20 rounded-md border bg-background px-1.5 text-sm text-foreground"
				value={settings[setting]}
				onChange={(event) =>
					update(setting, Math.max(1, Number(event.target.value) || 1))
				}
			/>
		</label>
	);
}

function Group({ title, children }: { title: string; children: ReactNode }) {
	return (
		<fieldset className="grid content-start gap-2 rounded-lg border p-3">
			<legend className="px-1 font-label text-xs font-semibold uppercase tracking-wide text-primary-text">
				{title}
			</legend>
			{children}
		</fieldset>
	);
}

/** Playground-style settings; each toggles an extension signal or a plugin. */
export function LabSettingsPanel() {
	const { reset } = useLabSettings();
	return (
		<div className="grid gap-3" data-testid="lab-settings">
			<div className="grid gap-3 md:grid-cols-2">
				<Group title="Typing">
					<Choice
						setting="markdownShortcuts"
						label="Markdown shortcuts engine"
						options={[
							{ value: "lexical-markdown", label: "@lexical/markdown" },
							{ value: "mdast", label: "@lexical/mdast (experimental)" },
							{ value: "off", label: "Off" },
						]}
					/>
					<Toggle
						setting="specialText"
						label="Special text"
						hint="Type [word] then a space; links and [@mentions] are left alone."
					/>
					<Toggle
						setting="autocomplete"
						label="Autocomplete"
						hint="Tab/→ accepts. English, Arabic, Hebrew word lists only — no Thai."
					/>
					<Toggle setting="maxLength" label="Max length (trims extra text)" />
					<NumberSetting setting="maxLengthValue" label="max" />
					<Choice
						setting="charLimit"
						label="Character limit (OverflowNode)"
						options={[
							{ value: "off", label: "Off" },
							{ value: "UTF-16", label: "UTF-16" },
							{ value: "UTF-8", label: "UTF-8 bytes" },
						]}
					/>
					<NumberSetting setting="charLimitValue" label="limit" />
					<Toggle
						setting="tabIndentation"
						label="Tab indents (TabIndentation)"
					/>
					<Toggle
						setting="preserveNewlinesInMarkdown"
						label="Preserve newlines in Markdown mode"
					/>
				</Group>
				<Group title="Code & tables">
					<Toggle setting="codeHighlighting" label="Code highlighting" />
					<Choice
						setting="codeHighlighter"
						label="Highlighter"
						options={[
							{ value: "shiki", label: "Shiki (@lexical/code-shiki)" },
							{ value: "prism", label: "Prism (@lexical/code-prism)" },
						]}
					/>
					<Toggle setting="tableCellMerge" label="Table cell merge" />
					<Toggle
						setting="tableCellBackgroundColor"
						label="Table cell background colour"
					/>
					<Toggle
						setting="tableHorizontalScroll"
						label="Table horizontal scroll"
					/>
					<Toggle setting="nestedTables" label="Nested tables (experimental)" />
					<Toggle setting="fitNestedTables" label="Fit nested tables" />
					<Toggle
						setting="tableStickyScrollbar"
						label="Sticky scrollbar under wide tables"
					/>
					<Toggle
						setting="listStrictIndent"
						label="Strict list indent (one level at a time)"
					/>
					<Toggle
						setting="checklistKeepsFocus"
						label="Clicking a checkbox does not focus the editor"
					/>
				</Group>
				<Group title="Links & selection">
					<Toggle
						setting="linkAttributes"
						label="Link attributes"
						hint='New links get rel="noopener noreferrer" target="_blank".'
					/>
					<Toggle
						setting="linksInNewTab"
						label="Clickable links open a new tab (read-only)"
					/>
					<Toggle
						setting="selectionAlwaysOnDisplay"
						label="Retain selection when blurred"
					/>
					<Toggle
						setting="selectBlock"
						label="Block selection (Ctrl/⌘+A selects the block first)"
					/>
					<Toggle
						setting="clickAfterLastBlock"
						label="Click below the last block adds a paragraph"
					/>
				</Group>
				<Group title="View & accessibility">
					<Toggle
						setting="visibleNonPrinting"
						label="Visible non-printing characters"
					/>
					<Choice
						setting="contextMenu"
						label="Right-click menu"
						options={[
							{ value: "registry", label: "shadcn-editor ContextMenu" },
							{ value: "lexical", label: "Lexical NodeContextMenuPlugin" },
						]}
					/>
					<Toggle
						setting="announcements"
						label="Screen-reader announcements"
						hint="Undo/redo, read-only, headings and auto-links (@lexical/a11y)."
					/>
					<p className="text-xs text-muted-foreground">
						Language / RTL: use the language selector in the bottom bar.
					</p>
				</Group>
			</div>
			<Group title="Panels">
				<div className="grid gap-2 sm:grid-cols-3">
					<Toggle setting="tableOfContents" label="Table of contents" />
					<Toggle setting="commentsPanel" label="Comments" />
					<Toggle setting="treeView" label="Tree view (debug)" />
					<Toggle setting="pasteLog" label="Paste log" />
					<Toggle setting="typingPerf" label="Typing performance" />
					<Toggle setting="testRecorder" label="Test recorder" />
				</div>
			</Group>
			<div>
				<Button variant="outline" size="sm" onClick={() => reset()}>
					Reset lab settings
				</Button>
			</div>
		</div>
	);
}

function Panel({
	title,
	children,
	testId,
}: {
	title: string;
	children: ReactNode;
	testId: string;
}) {
	return (
		<section
			className="min-w-0 rounded-lg border bg-background p-3"
			data-testid={testId}
		>
			<h3 className="mb-2 font-label text-xs font-semibold uppercase tracking-wide text-muted-foreground">
				{title}
			</h3>
			{children}
		</section>
	);
}

/** Debug and side panels switched on from the lab settings. */
export function LabPanels() {
	const { settings } = useLabSettings();
	const [perf, setPerf] = useState("Type in the editor to measure.");
	const onReport = useCallback((text: string) => setPerf(text), []);

	const any =
		settings.tableOfContents ||
		settings.commentsPanel ||
		settings.treeView ||
		settings.pasteLog ||
		settings.typingPerf ||
		settings.testRecorder;
	if (!any) return null;

	return (
		<div className="grid gap-3 border-t bg-muted/20 p-3 md:grid-cols-2">
			{settings.tableOfContents && (
				<Panel title="Table of contents" testId="panel-toc">
					<TableOfContentsPlugin />
				</Panel>
			)}
			{settings.commentsPanel && (
				<Panel title="Comments (local, in memory)" testId="panel-comments">
					<CommentsPanel />
				</Panel>
			)}
			{settings.treeView && (
				<div className="md:col-span-2">
					<Panel title="Tree view" testId="panel-tree-view">
						<TreeViewPlugin />
					</Panel>
				</div>
			)}
			{settings.pasteLog && (
				<Panel title="Paste log" testId="panel-paste-log">
					<PasteLogPlugin />
				</Panel>
			)}
			{settings.typingPerf && (
				<Panel title="Typing performance" testId="panel-typing-perf">
					<TypingPerfPlugin onReport={onReport} />
					<p className="text-sm" data-testid="typing-perf">
						{perf}
					</p>
				</Panel>
			)}
			{settings.testRecorder && (
				<Panel title="Test recorder" testId="panel-test-recorder">
					<TestRecorderPlugin />
				</Panel>
			)}
		</div>
	);
}

/** Compares @lexical/markdown with @lexical/mdast and runs a @lexical/headless export. */
function ExportComparison() {
	const [editor] = useLexicalComposerContext();
	const [result, setResult] = useState<{
		markdown: string;
		mdast: string;
		headless: string;
	} | null>(null);

	const run = () => {
		const markdown = editor.read(() => $exportMarkdown());
		const mdast = exportMdastMarkdown(editor);
		// @lexical/headless: a DOM-less editor with this editor's node classes
		// re-parses the JSON and generates HTML on its own.
		const headless = createHeadlessEditor({
			namespace: "poc-lexical-headless",
			nodes: Array.from(editor._nodes.values()).map((entry) => entry.klass),
			onError: (error) => console.error(error),
		});
		headless.setEditorState(
			headless.parseEditorState(JSON.stringify(editor.getEditorState())),
		);
		setResult({
			markdown,
			mdast,
			headless: headless.read(() => $generateHtmlFromNodes(headless, null)),
		});
	};

	return (
		<div className="grid gap-2">
			<div>
				<Button
					variant="outline"
					size="sm"
					onClick={run}
					data-testid="run-export-comparison"
				>
					Export with @lexical/markdown, @lexical/mdast and @lexical/headless
				</Button>
			</div>
			{result && (
				<div className="grid gap-2 lg:grid-cols-3">
					{(
						[
							["@lexical/markdown", result.markdown],
							["@lexical/mdast", result.mdast],
							["@lexical/headless → HTML", result.headless],
						] as const
					).map(([title, text]) => (
						<div key={title} className="min-w-0">
							<p className="mb-1 text-xs font-medium">
								{title}
								{title === "@lexical/mdast" &&
									(text === result.markdown
										? " — identical"
										: " — differs from @lexical/markdown")}
							</p>
							<pre
								className="max-h-64 overflow-auto whitespace-pre-wrap rounded-md border bg-muted/40 p-2 font-mono text-[11px]"
								data-testid={`export-${title.split("/")[1]?.split(" ")[0]}`}
							>
								{text}
							</pre>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

const PlainTextDemoExtension = defineExtension({
	name: "@poc/lexical/plain-text-demo",
	namespace: "poc-lexical-plain-text",
	dependencies: [
		PlainTextExtension,
		TailwindExtension,
		HistoryExtension,
		HashtagExtension,
		OverflowExtension,
		DragonExtension,
	],
	// TailwindExtension's hashtag class is a playground CSS class; use ours.
	theme: { hashtag: "rounded-sm bg-accent px-0.5 text-primary-text" },
	$initialEditorState: () => {
		$getRoot().append(
			$createParagraphNode().append(
				$createTextNode(
					"PlainTextExtension: Enter inserts a line break, not a paragraph. #hashtags still work. Over 120 characters turns red.",
				),
			),
		);
	},
});

/** A second editor built only from PlainTextExtension + the Tailwind theme extension. */
function PlainTextDemo() {
	return (
		<LexicalExtensionComposer
			extension={PlainTextDemoExtension}
			contentEditable={
				<ContentEditable
					className="min-h-16 rounded-md border bg-background px-3 py-2 text-sm outline-none"
					aria-label="Plain text editor"
					data-testid="plain-text-editor"
				/>
			}
		>
			<div className="mt-1 text-end text-xs text-muted-foreground">
				<CharacterLimitPlugin charset="UTF-16" maxLength={120} />
			</div>
		</LexicalExtensionComposer>
	);
}

/** The registry's ChatInput/ChatMessage pair (no AI: messages just echo locally). */
function ChatDemo() {
	const [messages, setMessages] = useState<{ id: number; markdown: string }[]>(
		[],
	);
	const extension = useMemo(
		() =>
			defineExtension({
				name: "@poc/lexical/chat-demo",
				namespace: "poc-lexical-chat",
				dependencies: [
					RichTextExtension,
					ListExtension,
					CheckListExtension,
					LinkExtension,
					CodeExtension,
					HistoryExtension,
					EmojiExtension,
					MentionExtension,
					VariableExtension,
				],
				theme: chatMessageTheme,
			}),
		[],
	);

	return (
		<div className="grid gap-2" data-testid="chat-demo">
			<div className="grid max-h-56 gap-2 overflow-y-auto">
				{messages.map((message) => (
					<div
						key={message.id}
						className="ms-auto max-w-[85%] rounded-xl bg-muted px-3 py-2 text-sm"
						data-testid="chat-message"
					>
						<ChatMessage extension={extension} content={message.markdown} />
					</div>
				))}
			</div>
			<ChatInput
				extension={extension}
				onSubmit={(value) =>
					setMessages((current) => [
						...current,
						{ id: current.length, markdown: value.markdown },
					])
				}
				placeholder={{
					en: "Write a message (Enter sends, Shift+Enter breaks)…",
				}}
			>
				<InputGroupAddon align="inline-end">
					<ChatInputSubmit />
				</InputGroupAddon>
			</ChatInput>
		</div>
	);
}

/** Collapsible "Lexical lab": settings, export comparison and extra editors. */
export function LexicalLab() {
	const [open, setOpen] = useState(false);
	return (
		<details
			className="border-t px-4 py-3 text-sm"
			data-testid="lexical-lab"
			open={open}
			onToggle={(event) => setOpen(event.currentTarget.open)}
		>
			<summary className="flex cursor-pointer items-center gap-2 font-label text-xs font-semibold uppercase tracking-wide text-primary-text">
				<FlaskConical className="size-4" /> Lexical lab — settings, debug
				panels, other editors
			</summary>
			{open && (
				<div className="mt-3 grid gap-4">
					<LabSettingsPanel />
					<Panel title="Export comparison" testId="panel-export">
						<ExportComparison />
					</Panel>
					<div className="grid gap-3 md:grid-cols-2">
						<Panel
							title="Plain-text editor (@lexical/plain-text + @lexical/tailwind)"
							testId="panel-plain-text"
						>
							<PlainTextDemo />
						</Panel>
						<Panel title="Chat input (shadcn-editor)" testId="panel-chat">
							<ChatDemo />
						</Panel>
						<Panel
							title="Legacy API: LexicalComposer + React plugins"
							testId="panel-legacy"
						>
							<LegacyComposerDemo />
						</Panel>
						<Panel
							title="Schema fuzzing (@lexical/fast-check)"
							testId="panel-fuzz"
						>
							<FuzzDemo />
						</Panel>
					</div>
					<Panel
						title="Pages: paginated layout (playground PagesExtension)"
						testId="panel-pages"
					>
						<PagesDemo />
					</Panel>
				</div>
			)}
		</details>
	);
}
