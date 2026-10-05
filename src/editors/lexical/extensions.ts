import {
	ClearEditorExtension,
	HorizontalRuleExtension,
	TabIndentationExtension,
} from "@lexical/extension";
import { HistoryExtension } from "@lexical/history";
import { CheckListExtension, ListExtension } from "@lexical/list";
import { RichTextExtension } from "@lexical/rich-text";
import { TableExtension } from "@lexical/table";
import type { AnyLexicalExtensionArgument } from "lexical";
import { AutoLinkExtension } from "@/editors/lexical/components/editor/extensions/auto-link";
import { CardExtension } from "@/editors/lexical/components/editor/extensions/card";
import { CodeExtension } from "@/editors/lexical/components/editor/extensions/code";
import { CollapsibleExtension } from "@/editors/lexical/components/editor/extensions/collapsible";
import { DateTimeExtension } from "@/editors/lexical/components/editor/extensions/datetime";
import { DragDropPasteExtension } from "@/editors/lexical/components/editor/extensions/drag-drop-paste";
import { EmojiExtension } from "@/editors/lexical/components/editor/extensions/emoji";
import { EquationExtension } from "@/editors/lexical/components/editor/extensions/equation";
import { FigmaExtension } from "@/editors/lexical/components/editor/extensions/figma";
import { FormatStateExtension } from "@/editors/lexical/components/editor/extensions/format-state";
import { ImageExtension } from "@/editors/lexical/components/editor/extensions/image";
import { LayoutExtension } from "@/editors/lexical/components/editor/extensions/layout";
import { LinkExtension } from "@/editors/lexical/components/editor/extensions/link";
import { MentionExtension } from "@/editors/lexical/components/editor/extensions/mention";
import { PollExtension } from "@/editors/lexical/components/editor/extensions/poll";
import { PullQuoteExtension } from "@/editors/lexical/components/editor/extensions/pullquote";
import { RubyExtension } from "@/editors/lexical/components/editor/extensions/ruby";
import { ShortcutsExtension } from "@/editors/lexical/components/editor/extensions/shortcuts";
import { SpeechToTextExtension } from "@/editors/lexical/components/editor/extensions/speech-to-text";
import { TabFocusExtension } from "@/editors/lexical/components/editor/extensions/tab-focus";
import { TwitterExtension } from "@/editors/lexical/components/editor/extensions/twitter";
import { YouTubeExtension } from "@/editors/lexical/components/editor/extensions/youtube";
import { ReactFindReplaceExtension } from "@/editors/lexical/components/editor/plugins/decorator/find-replace-panel";
import { ReactReviewExtension } from "@/editors/lexical/components/editor/plugins/decorator/review-plugin";
import { VariableExtension } from "./variable-node";

/**
 * Every extension that contributes a node (plus the decorators that render
 * them). Shared by the editable editor and the read-only renderer so the same
 * JSON can be loaded by both.
 */
export const CONTENT_EXTENSIONS: AnyLexicalExtensionArgument[] = [
	RichTextExtension,
	ListExtension,
	CheckListExtension,
	LinkExtension,
	CodeExtension,
	LayoutExtension,
	EmojiExtension,
	EquationExtension,
	TableExtension,
	HorizontalRuleExtension,
	ImageExtension,
	MentionExtension,
	VariableExtension,
	CardExtension,
	CollapsibleExtension,
	DateTimeExtension,
	PullQuoteExtension,
	ReactReviewExtension,
	PollExtension,
	RubyExtension,
	YouTubeExtension,
	TwitterExtension,
	FigmaExtension,
];

/**
 * The editor-x extension list from the shadcn-editor README minus:
 * Hashtag + ClipboardDOMImport (packages not installed), SpecialText
 * (turns any `[text]` into a node, which breaks typing markdown links and
 * mention syntax), Autocomplete (EN/AR/HE dictionaries only) and AI.
 */
export const EDITOR_EXTENSIONS: AnyLexicalExtensionArgument[] = [
	...CONTENT_EXTENSIONS,
	HistoryExtension,
	TabIndentationExtension,
	AutoLinkExtension,
	DragDropPasteExtension,
	TabFocusExtension,
	SpeechToTextExtension,
	ShortcutsExtension,
	FormatStateExtension,
	ReactFindReplaceExtension,
	ClearEditorExtension,
];
