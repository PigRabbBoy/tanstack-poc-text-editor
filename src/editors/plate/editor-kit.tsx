import {
	type AnyPluginConfig,
	type SlatePlugin,
	TrailingBlockPlugin,
} from "platejs";
import type { PlatePlugin } from "platejs/react";
import { AlignKit } from "@/editors/plate/components/editor/plugins/align-kit";
import { AutoformatKit } from "@/editors/plate/components/editor/plugins/autoformat-kit";
import { BasicBlocksKit } from "@/editors/plate/components/editor/plugins/basic-blocks-kit";
import { BasicMarksKit } from "@/editors/plate/components/editor/plugins/basic-marks-kit";
import { BlockMenuKit } from "@/editors/plate/components/editor/plugins/block-menu-kit";
import { BlockPlaceholderKit } from "@/editors/plate/components/editor/plugins/block-placeholder-kit";
import { CalloutKit } from "@/editors/plate/components/editor/plugins/callout-kit";
import { CodeBlockKit } from "@/editors/plate/components/editor/plugins/code-block-kit";
import { CodeDrawingKit } from "@/editors/plate/components/editor/plugins/code-drawing-kit";
import { ColumnKit } from "@/editors/plate/components/editor/plugins/column-kit";
import { CommentKit } from "@/editors/plate/components/editor/plugins/comment-kit";
import { CsvKit } from "@/editors/plate/components/editor/plugins/csv-kit";
import { CursorOverlayKit } from "@/editors/plate/components/editor/plugins/cursor-overlay-kit";
import { DateKit } from "@/editors/plate/components/editor/plugins/date-kit";
import { DiscussionKit } from "@/editors/plate/components/editor/plugins/discussion-kit";
import { DndKit } from "@/editors/plate/components/editor/plugins/dnd-kit";
import { DocxKit } from "@/editors/plate/components/editor/plugins/docx-kit";
import { EmojiKit } from "@/editors/plate/components/editor/plugins/emoji-kit";
import { ExcalidrawKit } from "@/editors/plate/components/editor/plugins/excalidraw-kit";
import { ExitBreakKit } from "@/editors/plate/components/editor/plugins/exit-break-kit";
import { FindReplaceKit } from "@/editors/plate/components/editor/plugins/find-replace-kit";
import { FixedToolbarKit as FixedToolbarClassicKit } from "@/editors/plate/components/editor/plugins/fixed-toolbar-classic-kit";
import { FixedToolbarKit } from "@/editors/plate/components/editor/plugins/fixed-toolbar-kit";
import { FloatingToolbarKit as FloatingToolbarClassicKit } from "@/editors/plate/components/editor/plugins/floating-toolbar-classic-kit";
import { FloatingToolbarKit } from "@/editors/plate/components/editor/plugins/floating-toolbar-kit";
import { FontKit } from "@/editors/plate/components/editor/plugins/font-kit";
import { FootnoteKit } from "@/editors/plate/components/editor/plugins/footnote-kit";
import { IndentKit } from "@/editors/plate/components/editor/plugins/indent-kit";
import { LineHeightKit } from "@/editors/plate/components/editor/plugins/line-height-kit";
import { LinkKit } from "@/editors/plate/components/editor/plugins/link-kit";
import { ListKit as ListClassicKit } from "@/editors/plate/components/editor/plugins/list-classic-kit";
import { ListKit } from "@/editors/plate/components/editor/plugins/list-kit";
import { MarkdownKit } from "@/editors/plate/components/editor/plugins/markdown-kit";
import { MathKit } from "@/editors/plate/components/editor/plugins/math-kit";
import { MediaKit } from "@/editors/plate/components/editor/plugins/media-kit";
import { MentionKit } from "@/editors/plate/components/editor/plugins/mention-kit";
import { SlashKit } from "@/editors/plate/components/editor/plugins/slash-kit";
import { SuggestionKit } from "@/editors/plate/components/editor/plugins/suggestion-kit";
import { TabbableKit } from "@/editors/plate/components/editor/plugins/tabbable-kit";
import { TableKit } from "@/editors/plate/components/editor/plugins/table-kit";
import { TocKit } from "@/editors/plate/components/editor/plugins/toc-kit";
import { ToggleKit } from "@/editors/plate/components/editor/plugins/toggle-kit";
import { VariableKit } from "./variable-kit";

type AnyPlugin = PlatePlugin<AnyPluginConfig> | SlatePlugin<AnyPluginConfig>;

/** The parts that differ between the indent-list and classic-list compositions. */
type Variant = {
	lists: readonly AnyPlugin[];
	slash: readonly AnyPlugin[];
	toolbars: readonly AnyPlugin[];
};

/** Node types and marks only: enough to render a value read-only (diff viewer). */
export const ContentKit = [
	...BasicBlocksKit,
	...CodeBlockKit,
	...TableKit,
	...ToggleKit,
	...TocKit,
	...MediaKit,
	...CalloutKit,
	...ColumnKit,
	...MathKit,
	...DateKit,
	...LinkKit,
	...MentionKit,
	...VariableKit,
	...ExcalidrawKit,
	...CodeDrawingKit,
	...FootnoteKit,
	...BasicMarksKit,
	...FontKit,
	...ListKit,
	...AlignKit,
	...LineHeightKit,
];

function composeKit({ lists, slash, toolbars }: Variant) {
	return [
		// Elements
		...BasicBlocksKit,
		...CodeBlockKit,
		...TableKit,
		...ToggleKit,
		...TocKit,
		...MediaKit,
		...CalloutKit,
		...ColumnKit,
		...MathKit,
		...DateKit,
		...LinkKit,
		...MentionKit,
		...VariableKit,
		...ExcalidrawKit,
		...CodeDrawingKit,
		...FootnoteKit,

		// Marks
		...BasicMarksKit,
		...FontKit,

		// Block style
		...lists,
		...AlignKit,
		...LineHeightKit,

		// Comments & suggestions (local only, no collaboration backend)
		...DiscussionKit,
		...CommentKit,
		...SuggestionKit,

		// Editing
		...slash,
		...AutoformatKit,
		...CursorOverlayKit,
		...BlockMenuKit,
		...DndKit,
		...EmojiKit,
		...ExitBreakKit,
		...FindReplaceKit,
		TabbableKit,
		TrailingBlockPlugin,

		// Parsers (Word import/export via @platejs/docx-io is lazy, see docx-io.ts).
		// Paste parsers run last-plugin-first, so CSV must come after Markdown or
		// the markdown text/plain parser swallows CSV.
		...DocxKit,
		...MarkdownKit,
		...CsvKit,

		// UI
		...BlockPlaceholderKit,
		...toolbars,
	];
}

/**
 * Our composition of the Plate registry's `editor-kit` — everything free,
 * minus `AIKit` / `CopilotKit` (AI) and `@platejs/yjs` (collaboration),
 * plus the documented plugins the registry kit leaves out (find, CSV paste,
 * tabbable, font weight). Core plugins (history, node id, navigation
 * feedback, affinity, HTML) come with `usePlateEditor`.
 */
export const EditorKit = composeKit({
	lists: ListKit,
	slash: SlashKit,
	toolbars: [...FixedToolbarKit, ...FloatingToolbarKit],
});

/**
 * The registry's "classic" variant: nested ul/ol/li lists (@platejs/list-classic)
 * with the classic toolbars, for the lab. Indent lists and classic lists define
 * competing markdown/autoformat/paste rules, so they live in separate editors.
 * The slash menu inserts indent-list blocks, so it is left out here.
 */
export const ClassicListEditorKit = composeKit({
	lists: [...IndentKit, ...ListClassicKit],
	slash: [],
	toolbars: [...FixedToolbarClassicKit, ...FloatingToolbarClassicKit],
});
