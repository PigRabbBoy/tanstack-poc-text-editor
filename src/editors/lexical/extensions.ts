import {
	EditorModeAnnounceExtension,
	FocusManagerExtension,
	FocusTrapExtension,
	HistoryAnnounceExtension,
	RovingTabIndexExtension,
} from "@lexical/a11y";
import {
	ClipboardDOMImportExtension,
	ClipboardImportExtension,
	GetClipboardDataExtension,
} from "@lexical/clipboard";
import { CodePrismExtension } from "@lexical/code-prism";
import { DragonExtension } from "@lexical/dragon";
import {
	AutoFocusExtension,
	ClearEditorExtension,
	ClickAfterLastBlockExtension,
	DecoratorTextExtension,
	EditorStateExtension,
	HorizontalRuleExtension,
	NodeSelectionDataSelectedExtension,
	SelectBlockExtension,
	SelectionAlwaysOnDisplayExtension,
	TabIndentationExtension,
	WatchEditableExtension,
} from "@lexical/extension";
import { HashtagExtension } from "@lexical/hashtag";
import { HistoryExtension } from "@lexical/history";
import {
	AutoLinkAnnounceExtension,
	ClickableLinkExtension,
	LinkExtension as LexicalLinkExtension,
} from "@lexical/link";
import { CheckListExtension, ListExtension } from "@lexical/list";
import { MarkExtension } from "@lexical/mark";
import {
	MdastCommonMarkExtension,
	MdastExtension,
	MdastGfmExtension,
	MdastShortcutsExtension,
} from "@lexical/mdast";
import { OverflowExtension } from "@lexical/overflow";
import { TreeViewExtension } from "@lexical/react/TreeViewExtension";
import {
	HeadingAnnounceExtension,
	RichTextExtension,
} from "@lexical/rich-text";
import { TableExtension } from "@lexical/table";
import {
	type AnyLexicalExtensionArgument,
	configExtension,
	defineExtension,
} from "lexical";
import { AutoLinkExtension } from "@/editors/lexical/components/editor/extensions/auto-link";
import { AutocompleteExtension } from "@/editors/lexical/components/editor/extensions/autocomplete";
import { CardExtension } from "@/editors/lexical/components/editor/extensions/card";
import { CodeExtension } from "@/editors/lexical/components/editor/extensions/code";
import { CollapsibleExtension } from "@/editors/lexical/components/editor/extensions/collapsible";
import { CommentExtension } from "@/editors/lexical/components/editor/extensions/comment";
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
import { SpecialTextExtension } from "@/editors/lexical/components/editor/extensions/special-text";
import { SpeechToTextExtension } from "@/editors/lexical/components/editor/extensions/speech-to-text";
import { TabFocusExtension } from "@/editors/lexical/components/editor/extensions/tab-focus";
import { TwitterExtension } from "@/editors/lexical/components/editor/extensions/twitter";
import { YouTubeExtension } from "@/editors/lexical/components/editor/extensions/youtube";
import { ImageNode } from "@/editors/lexical/components/editor/nodes/image-node";
import { ReactFindReplaceExtension } from "@/editors/lexical/components/editor/plugins/decorator/find-replace-panel";
import { ReactReviewExtension } from "@/editors/lexical/components/editor/plugins/decorator/review-plugin";
import { TreeViewConfig } from "@/editors/lexical/components/playground/dev-tools";
import { ExcalidrawExtension } from "@/editors/lexical/components/playground/excalidraw";
import { InlineImageExtension } from "@/editors/lexical/components/playground/inline-image";
import { KeywordsExtension } from "@/editors/lexical/components/playground/keywords";
import { MaxLengthExtension } from "@/editors/lexical/components/playground/max-length";
import { PageBreakExtension } from "@/editors/lexical/components/playground/page-break";
import { StickyExtension } from "@/editors/lexical/components/playground/sticky";
import { TerseExportExtension } from "@/editors/lexical/components/playground/terse-export";
import { VisibleNonPrintingExtension } from "@/editors/lexical/components/playground/visible-non-printing";
import { ClipboardConventionsExtension } from "./clipboard";
import { ConventionsImportExtension } from "./html-import";
import { MdastConventionsExtension } from "./mdast";
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
	HashtagExtension,
	KeywordsExtension,
	SpecialTextExtension,
	MarkExtension,
	OverflowExtension,
	PageBreakExtension,
	StickyExtension,
	ExcalidrawExtension,
	InlineImageExtension,
	ConventionsImportExtension,
	// Selected decorator hosts get `data-selected` (official, experimental).
	configExtension(NodeSelectionDataSelectedExtension, {
		nodes: [ImageNode],
	}),
];

/** Accessibility announcements and focus helpers from @lexical/a11y + friends. */
const A11Y_EXTENSIONS: AnyLexicalExtensionArgument[] = [
	HistoryAnnounceExtension,
	EditorModeAnnounceExtension,
	AutoLinkAnnounceExtension,
	HeadingAnnounceExtension,
	FocusManagerExtension,
	RovingTabIndexExtension,
	FocusTrapExtension,
];

/**
 * The editor-x extension list from the shadcn-editor README, plus the
 * official extensions and playground ports this POC adds. Opt-in features
 * (special text, autocomplete, max length, Prism, mdast shortcuts, visible
 * non-printing) start disabled and are switched on from the Lab panel via
 * their config signals.
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
	CommentExtension,
	DecoratorTextExtension,
	DragonExtension,
	EditorStateExtension,
	WatchEditableExtension,
	configExtension(AutoFocusExtension, { defaultSelection: "rootStart" }),
	ClickAfterLastBlockExtension,
	configExtension(SelectBlockExtension, { cascadeSelection: true }),
	configExtension(SelectionAlwaysOnDisplayExtension, { disabled: true }),
	configExtension(ClickableLinkExtension, { newTab: true }),
	configExtension(LexicalLinkExtension, { attributes: undefined }),
	configExtension(AutocompleteExtension, { disabled: true }),
	configExtension(CodePrismExtension, { disabled: true }),
	MaxLengthExtension,
	VisibleNonPrintingExtension,
	TerseExportExtension,
	ClipboardDOMImportExtension,
	ClipboardImportExtension,
	GetClipboardDataExtension,
	ClipboardConventionsExtension,
	MdastExtension,
	MdastCommonMarkExtension,
	MdastGfmExtension,
	MdastConventionsExtension,
	configExtension(MdastShortcutsExtension, { disabled: true }),
	configExtension(TreeViewExtension, TreeViewConfig),
	...A11Y_EXTENSIONS,
	defineExtension({
		name: "@poc/lexical/clickable-links-when-read-only",
		dependencies: [WatchEditableExtension, ClickableLinkExtension],
		register: (_editor, _config, state) => {
			const editable = state.getDependency(WatchEditableExtension).output;
			const clickable = state.getDependency(ClickableLinkExtension).output;
			// Links open on click only in read-only mode, like the playground.
			return editable.subscribe((isEditable) => {
				clickable.disabled.value = isEditable;
			});
		},
	}),
];
