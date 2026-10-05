import { TrailingBlockPlugin } from "platejs";
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
import { CursorOverlayKit } from "@/editors/plate/components/editor/plugins/cursor-overlay-kit";
import { DateKit } from "@/editors/plate/components/editor/plugins/date-kit";
import { DiscussionKit } from "@/editors/plate/components/editor/plugins/discussion-kit";
import { DndKit } from "@/editors/plate/components/editor/plugins/dnd-kit";
import { DocxKit } from "@/editors/plate/components/editor/plugins/docx-kit";
import { EmojiKit } from "@/editors/plate/components/editor/plugins/emoji-kit";
import { ExcalidrawKit } from "@/editors/plate/components/editor/plugins/excalidraw-kit";
import { ExitBreakKit } from "@/editors/plate/components/editor/plugins/exit-break-kit";
import { FixedToolbarKit } from "@/editors/plate/components/editor/plugins/fixed-toolbar-kit";
import { FloatingToolbarKit } from "@/editors/plate/components/editor/plugins/floating-toolbar-kit";
import { FontKit } from "@/editors/plate/components/editor/plugins/font-kit";
import { FootnoteKit } from "@/editors/plate/components/editor/plugins/footnote-kit";
import { LineHeightKit } from "@/editors/plate/components/editor/plugins/line-height-kit";
import { LinkKit } from "@/editors/plate/components/editor/plugins/link-kit";
import { ListKit } from "@/editors/plate/components/editor/plugins/list-kit";
import { MarkdownKit } from "@/editors/plate/components/editor/plugins/markdown-kit";
import { MathKit } from "@/editors/plate/components/editor/plugins/math-kit";
import { MediaKit } from "@/editors/plate/components/editor/plugins/media-kit";
import { MentionKit } from "@/editors/plate/components/editor/plugins/mention-kit";
import { SlashKit } from "@/editors/plate/components/editor/plugins/slash-kit";
import { SuggestionKit } from "@/editors/plate/components/editor/plugins/suggestion-kit";
import { TableKit } from "@/editors/plate/components/editor/plugins/table-kit";
import { TocKit } from "@/editors/plate/components/editor/plugins/toc-kit";
import { ToggleKit } from "@/editors/plate/components/editor/plugins/toggle-kit";
import { VariableKit } from "./variable-kit";

/**
 * Our composition of the Plate registry's `editor-kit` — everything free,
 * minus `AIKit` / `CopilotKit` (AI) and `@platejs/yjs` (collaboration).
 */
export const EditorKit = [
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
	...ListKit,
	...AlignKit,
	...LineHeightKit,

	// Comments & suggestions (local only, no collaboration backend)
	...DiscussionKit,
	...CommentKit,
	...SuggestionKit,

	// Editing
	...SlashKit,
	...AutoformatKit,
	...CursorOverlayKit,
	...BlockMenuKit,
	...DndKit,
	...EmojiKit,
	...ExitBreakKit,
	TrailingBlockPlugin,

	// Parsers
	...DocxKit,
	...MarkdownKit,

	// UI
	...BlockPlaceholderKit,
	...FixedToolbarKit,
	...FloatingToolbarKit,
];
