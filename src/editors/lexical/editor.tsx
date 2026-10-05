import { $generateHtmlFromNodes } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { NodeEventPlugin } from "@lexical/react/LexicalNodeEventPlugin";
import { useLexicalFocusManagerRef } from "@lexical/react/useLexicalFocusManagerRef";
import { useLexicalRovingTabIndexRef } from "@lexical/react/useLexicalRovingTabIndexRef";
import { $getNodeByKey, defineExtension, type LexicalEditor } from "lexical";
import { Sparkles } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { VARIABLES } from "@/data/variables";
import { ActivityBar } from "@/editors/lexical/components/editor/plugins/activitybar/activitybar-plugin";
import { CountPlugin } from "@/editors/lexical/components/editor/plugins/activitybar/count-plugin";
import { ReadOnlyTogglePlugin } from "@/editors/lexical/components/editor/plugins/activitybar/read-only-toggle-plugin";
import { ShortcutPlugin } from "@/editors/lexical/components/editor/plugins/activitybar/shortcut-plugin";
import { SpeechToTextPlugin } from "@/editors/lexical/components/editor/plugins/activitybar/speech-to-text-plugin";
import { AutoEmbedPlugin } from "@/editors/lexical/components/editor/plugins/auto-embed-plugin";
import { BlockInsert } from "@/editors/lexical/components/editor/plugins/block-insert/block-insert-plugin";
import { InsertCodeBlockPlugin } from "@/editors/lexical/components/editor/plugins/block-insert/insert-code-block-plugin";
import { InsertColumnsPlugin } from "@/editors/lexical/components/editor/plugins/block-insert/insert-columns-plugin";
import { InsertEmojiPlugin } from "@/editors/lexical/components/editor/plugins/block-insert/insert-emoji-plugin";
import { InsertEquationPlugin } from "@/editors/lexical/components/editor/plugins/block-insert/insert-equation-plugin";
import { InsertFigmaPlugin } from "@/editors/lexical/components/editor/plugins/block-insert/insert-figma-plugin";
import { InsertHorizontalRulePlugin } from "@/editors/lexical/components/editor/plugins/block-insert/insert-horizontal-rule-plugin";
import { InsertImagePlugin } from "@/editors/lexical/components/editor/plugins/block-insert/insert-image-plugin";
import { InsertTablePlugin } from "@/editors/lexical/components/editor/plugins/block-insert/insert-table-plugin";
import { InsertTwitterPlugin } from "@/editors/lexical/components/editor/plugins/block-insert/insert-twitter-plugin";
import { InsertYouTubePlugin } from "@/editors/lexical/components/editor/plugins/block-insert/insert-youtube-plugin";
import { BulletedListPickerPlugin } from "@/editors/lexical/components/editor/plugins/component-picker/bulleted-list-picker-plugin";
import { CardPickerPlugin } from "@/editors/lexical/components/editor/plugins/component-picker/card-picker-plugin";
import { CheckListPickerPlugin } from "@/editors/lexical/components/editor/plugins/component-picker/check-list-picker-plugin";
import { CodePickerPlugin } from "@/editors/lexical/components/editor/plugins/component-picker/code-picker-plugin";
import { CollapsiblePickerPlugin } from "@/editors/lexical/components/editor/plugins/component-picker/collapsible-picker-plugin";
import { ColumnsPickerPlugin } from "@/editors/lexical/components/editor/plugins/component-picker/columns-picker-plugin";
import { ComponentPicker } from "@/editors/lexical/components/editor/plugins/component-picker/component-picker-plugin";
import { DateTimePickerPlugin } from "@/editors/lexical/components/editor/plugins/component-picker/datetime-picker-plugin";
import { DividerPickerPlugin } from "@/editors/lexical/components/editor/plugins/component-picker/divider-picker-plugin";
import { HeadingPickerPlugin } from "@/editors/lexical/components/editor/plugins/component-picker/heading-picker-plugin";
import { ImagePickerPlugin } from "@/editors/lexical/components/editor/plugins/component-picker/image-picker-plugin";
import { NumberedListPickerPlugin } from "@/editors/lexical/components/editor/plugins/component-picker/numbered-list-picker-plugin";
import { ParagraphPickerPlugin } from "@/editors/lexical/components/editor/plugins/component-picker/paragraph-picker-plugin";
import { PollPickerPlugin } from "@/editors/lexical/components/editor/plugins/component-picker/poll-picker-plugin";
import { PullQuotePickerPlugin } from "@/editors/lexical/components/editor/plugins/component-picker/pullquote-picker-plugin";
import { QuotePickerPlugin } from "@/editors/lexical/components/editor/plugins/component-picker/quote-picker-plugin";
import { ReviewPickerPlugin } from "@/editors/lexical/components/editor/plugins/component-picker/review-picker-plugin";
import { TablePickerPlugin } from "@/editors/lexical/components/editor/plugins/component-picker/table-picker-plugin";
import { ContentEditable } from "@/editors/lexical/components/editor/plugins/content-editable";
import { ContextMenuPlugin } from "@/editors/lexical/components/editor/plugins/context-menu-plugin";
import { DraggableBlockPlugin } from "@/editors/lexical/components/editor/plugins/draggable-block-plugin";
import { EmojiPickerPlugin } from "@/editors/lexical/components/editor/plugins/emoji-picker-plugin";
import { CommentPlugin } from "@/editors/lexical/components/editor/plugins/floating/comment-plugin";
import { FloatingToolbarPlugin } from "@/editors/lexical/components/editor/plugins/floating/floating-toolbar-plugin";
import { LinkEditorPlugin } from "@/editors/lexical/components/editor/plugins/floating/link-editor-plugin";
import { RubyEditorPlugin } from "@/editors/lexical/components/editor/plugins/floating/ruby-editor-plugin";
import { TableHoverActionsPlugin } from "@/editors/lexical/components/editor/plugins/floating/table-hover-actions-plugin";
import {
	LanguageProvider,
	LanguageSelectorPlugin,
	useLanguage,
} from "@/editors/lexical/components/editor/plugins/i18n-plugin";
import { MentionPlugin } from "@/editors/lexical/components/editor/plugins/mention-plugin";
import { BlockFormatToolbarPlugin } from "@/editors/lexical/components/editor/plugins/toolbar/block-format-toolbar-plugin";
import { ClearToolbarPlugin } from "@/editors/lexical/components/editor/plugins/toolbar/clear-toolbar-plugin";
import { ColorToolbarPlugin } from "@/editors/lexical/components/editor/plugins/toolbar/color-toolbar-plugin";
import { ElementFormatToolbarPlugin } from "@/editors/lexical/components/editor/plugins/toolbar/element-format-toolbar-plugin";
import { FindReplaceToolbarPlugin } from "@/editors/lexical/components/editor/plugins/toolbar/find-replace-toolbar-plugin";
import { FontFamilyToolbarPlugin } from "@/editors/lexical/components/editor/plugins/toolbar/font-family-toolbar-plugin";
import { FontSizeToolbarPlugin } from "@/editors/lexical/components/editor/plugins/toolbar/font-size-toolbar-plugin";
import { HistoryToolbarPlugin } from "@/editors/lexical/components/editor/plugins/toolbar/history-toolbar-plugin";
import { ImportExportToolbarPlugin } from "@/editors/lexical/components/editor/plugins/toolbar/import-export-toolbar-plugin";
import { IndentToolbarPlugin } from "@/editors/lexical/components/editor/plugins/toolbar/indent-toolbar-plugin";
import { LinkToolbarPlugin } from "@/editors/lexical/components/editor/plugins/toolbar/link-toolbar-plugin";
import { RubyToolbarPlugin } from "@/editors/lexical/components/editor/plugins/toolbar/ruby-toolbar-plugin";
import { TextFormatToolbarPlugin } from "@/editors/lexical/components/editor/plugins/toolbar/text-format-toolbar-plugin";
import { Toolbar } from "@/editors/lexical/components/editor/plugins/toolbar/toolbar-plugin";
import { CodeActionMenuPlugin } from "@/editors/lexical/components/playground/code-action-menu";
import { LexicalNodeContextMenu } from "@/editors/lexical/components/playground/dev-tools";
import { ExcalidrawPlugin } from "@/editors/lexical/components/playground/excalidraw";
import { InlineImagePlugin } from "@/editors/lexical/components/playground/inline-image";
import { STICKY_LAYER_ATTRIBUTE } from "@/editors/lexical/components/playground/sticky";
import { TableActionMenuPlugin } from "@/editors/lexical/components/playground/table-action-menu";
import { TableCellResizerPlugin } from "@/editors/lexical/components/playground/table-cell-resizer";
import { TableFitNestedTablePlugin } from "@/editors/lexical/components/playground/table-fit-nested";
import { TableScrollShadowPlugin } from "@/editors/lexical/components/playground/table-scroll-shadow";
import { ButtonGroup } from "@/editors/lexical/ui/button-group";
import { DirectionProvider } from "@/editors/lexical/ui/direction";
import type { EditorProps, Snapshot } from "@/editors/types";
import { PlaygroundActions } from "./actions";
import { EDITOR_EXTENSIONS } from "./extensions";
import { PlaygroundInsertButtons, PlaygroundPickerPlugin } from "./inserts";
import { LabPanels, LexicalLab } from "./lab";
import { $exportMarkdown, $importMarkdown } from "./markdown";
import { meta } from "./meta";
import {
	LabSettingsProvider,
	LabSettingsSync,
	useLabSettings,
} from "./settings";
import { CaretOffsetStatus, CharacterLimit } from "./status";
import { editorTheme } from "./theme";
import { EDITOR_TRANSFORMERS } from "./transformers";
import { $isVariableNode, VariableNode } from "./variable-node";
import {
	VariablePickerPlugin,
	VariableTypeaheadPlugin,
} from "./variable-plugin";

function takeSnapshot(editor: LexicalEditor): Snapshot {
	const state = editor.getEditorState();
	return {
		json: state.toJSON(),
		markdown: state.read(() => $exportMarkdown()),
		html: editor.read(() => $generateHtmlFromNodes(editor, null)),
	};
}

/** Reports a snapshot once after load and then on every content change. */
function SnapshotPlugin({ onChange }: Pick<EditorProps, "onChange">) {
	const [editor] = useLexicalComposerContext();
	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;

	useEffect(() => {
		onChangeRef.current(takeSnapshot(editor));
		return editor.registerUpdateListener(({ dirtyElements, dirtyLeaves }) => {
			if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;
			onChangeRef.current(takeSnapshot(editor));
		});
	}, [editor]);

	return null;
}

/** Double-clicking a variable chip shows its sample value (official NodeEventPlugin). */
function VariableDetailsPlugin() {
	return (
		<NodeEventPlugin
			nodeType={VariableNode}
			eventType="dblclick"
			eventListener={(_event, editor, nodeKey) => {
				const name = editor.read(() => {
					const node = $getNodeByKey(nodeKey);
					return $isVariableNode(node) ? node.getName() : null;
				});
				const variable = VARIABLES.find((item) => item.name === name);
				if (variable) {
					toast.info(`{{${variable.name}}} — ${variable.label}`, {
						description: `Sample value: ${variable.sample}`,
					});
				}
			}}
		/>
	);
}

/** RTL/LTR follows the registry's language selector (DirectionProvider from shadcn). */
function EditorWrapper({ children }: { children: ReactNode }) {
	const { language, dir } = useLanguage();
	return (
		<DirectionProvider direction={dir}>
			<div
				dir={dir}
				lang={language}
				className="relative flex min-h-[60vh] w-full flex-col overflow-hidden rounded-xl border bg-card shadow-card"
				data-testid="lexical-editor"
			>
				{children}
			</div>
		</DirectionProvider>
	);
}

/** Toolbar with @lexical/a11y focus management: Alt+F10 jumps here, arrows rove. */
function AccessibleToolbar({ children }: { children: ReactNode }) {
	const focusRef = useLexicalFocusManagerRef({
		toolbarItemSelector: "button:not([disabled])",
	});
	const rovingRef = useLexicalRovingTabIndexRef({
		itemSelector: "button:not([disabled])",
		orientation: "horizontal",
	});
	const ref = useCallback(
		(element: HTMLDivElement | null) => {
			focusRef(element);
			rovingRef(element);
		},
		[focusRef, rovingRef],
	);
	return (
		<Toolbar ref={ref} className="sticky top-0 z-10 bg-muted/60">
			{children}
		</Toolbar>
	);
}

function Showcase() {
	return (
		<details className="border-t px-4 py-3 text-sm" data-testid="showcase">
			<summary className="flex cursor-pointer items-center gap-2 font-label text-xs font-semibold uppercase tracking-wide text-primary-text">
				<Sparkles className="size-4" /> Lexical showcase — try these
			</summary>
			<ul className="mt-2 list-disc space-y-1 ps-5 text-muted-foreground">
				{meta.showcase.map((item) => (
					<li key={item}>{item}</li>
				))}
			</ul>
		</details>
	);
}

/** Exposes the editor for debugging (`window.__lexicalPocEditor`), via EditorRefPlugin. */
function exposeEditor(editor: LexicalEditor | null) {
	(
		window as unknown as { __lexicalPocEditor?: LexicalEditor | null }
	).__lexicalPocEditor = editor;
}

function EditorBody({ onChange }: Pick<EditorProps, "onChange">) {
	const { settings } = useLabSettings();

	return (
		<EditorWrapper>
			<AccessibleToolbar>
				<HistoryToolbarPlugin />
				<BlockFormatToolbarPlugin />
				<FontFamilyToolbarPlugin />
				<FontSizeToolbarPlugin />
				<ColorToolbarPlugin />
				<TextFormatToolbarPlugin formats="all" />
				<LinkToolbarPlugin />
				<RubyToolbarPlugin />
				<ElementFormatToolbarPlugin formats="basic" />
				<IndentToolbarPlugin />
				<BlockInsert>
					<InsertCodeBlockPlugin />
					<InsertColumnsPlugin />
					<InsertEmojiPlugin />
					<InsertEquationPlugin />
					<InsertHorizontalRulePlugin />
					<InsertImagePlugin />
					<InsertTablePlugin />
					<InsertYouTubePlugin />
					<InsertTwitterPlugin />
					<InsertFigmaPlugin />
				</BlockInsert>
				<ButtonGroup>
					<PlaygroundInsertButtons />
				</ButtonGroup>
				<FindReplaceToolbarPlugin />
				<ClearToolbarPlugin />
				<ImportExportToolbarPlugin transformers={EDITOR_TRANSFORMERS} />
			</AccessibleToolbar>
			<div
				className="relative min-w-0 flex-1"
				{...{ [STICKY_LAYER_ATTRIBUTE]: "" }}
			>
				<ContentEditable
					data-testid="lexical-content"
					variant="draggable"
					className="lexical-poc-content min-h-[55vh] text-base leading-7"
					placeholder={{
						en: "Type “/” for blocks, “@” to mention, “{{” for a variable…",
					}}
				/>
				<DraggableBlockPlugin />
				<FloatingToolbarPlugin />
				<LinkEditorPlugin />
				<RubyEditorPlugin />
				<TableHoverActionsPlugin />
				<TableActionMenuPlugin cellMerge={settings.tableCellMerge} />
				<TableCellResizerPlugin />
				<TableScrollShadowPlugin />
				{settings.fitNestedTables && <TableFitNestedTablePlugin />}
				<CodeActionMenuPlugin highlighter={settings.codeHighlighter} />
				<EmojiPickerPlugin />
				<MentionPlugin />
				<VariableTypeaheadPlugin />
				<VariableDetailsPlugin />
				<AutoEmbedPlugin />
				{settings.contextMenu === "lexical" ? (
					<LexicalNodeContextMenu />
				) : (
					<ContextMenuPlugin />
				)}
				<CommentPlugin />
				<ExcalidrawPlugin />
				<InlineImagePlugin />
				<ComponentPicker>
					<ParagraphPickerPlugin />
					<VariablePickerPlugin />
					<HeadingPickerPlugin />
					<TablePickerPlugin />
					<NumberedListPickerPlugin />
					<BulletedListPickerPlugin />
					<CheckListPickerPlugin />
					<QuotePickerPlugin />
					<CodePickerPlugin />
					<DividerPickerPlugin />
					<ColumnsPickerPlugin />
					<ImagePickerPlugin />
					<CardPickerPlugin />
					<CollapsiblePickerPlugin />
					<DateTimePickerPlugin />
					<PullQuotePickerPlugin />
					<ReviewPickerPlugin />
					<PollPickerPlugin />
					<PlaygroundPickerPlugin />
				</ComponentPicker>
				{settings.markdownShortcuts === "lexical-markdown" && (
					<MarkdownShortcutPlugin transformers={EDITOR_TRANSFORMERS} />
				)}
				<EditorRefPlugin editorRef={exposeEditor} />
				<LabSettingsSync />
				<SnapshotPlugin onChange={onChange} />
			</div>
			<ActivityBar className="bg-muted/40">
				<div className="flex items-center gap-3">
					<CountPlugin />
					<CaretOffsetStatus />
					{settings.charLimit !== "off" && (
						<CharacterLimit
							charset={settings.charLimit}
							maxLength={settings.charLimitValue}
						/>
					)}
				</div>
				<div className="ms-auto flex items-center gap-3">
					<PlaygroundActions />
					<SpeechToTextPlugin />
					<ReadOnlyTogglePlugin />
					<ShortcutPlugin />
					<LanguageSelectorPlugin />
				</div>
			</ActivityBar>
			<LabPanels />
			<Showcase />
			<LexicalLab />
		</EditorWrapper>
	);
}

export default function Editor({
	initialMarkdown,
	storedJson,
	onChange,
}: EditorProps) {
	// The extension must be stable: the page remounts us (via `key`) to reload.
	// biome-ignore lint/correctness/useExhaustiveDependencies: load once per mount
	const app = useMemo(
		() =>
			defineExtension({
				name: "@poc/lexical/editor",
				namespace: "poc-lexical",
				dependencies: EDITOR_EXTENSIONS,
				theme: editorTheme,
				$initialEditorState:
					storedJson === null
						? () => $importMarkdown(initialMarkdown)
						: JSON.stringify(storedJson),
				onError: (error: Error) => {
					console.error(error);
				},
			}),
		[],
	);

	return (
		<LanguageProvider>
			<LabSettingsProvider>
				<LexicalExtensionComposer extension={app} contentEditable={null}>
					<EditorBody onChange={onChange} />
				</LexicalExtensionComposer>
			</LabSettingsProvider>
		</LanguageProvider>
	);
}
