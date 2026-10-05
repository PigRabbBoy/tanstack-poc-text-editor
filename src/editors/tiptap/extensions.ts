import Audio from "@tiptap/extension-audio";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import {
	Details,
	DetailsContent,
	DetailsSummary,
} from "@tiptap/extension-details";
import Emoji, { gitHubEmojis } from "@tiptap/extension-emoji";
import Highlight from "@tiptap/extension-highlight";
import { ListKit } from "@tiptap/extension-list";
import Mathematics from "@tiptap/extension-mathematics";
import RubyText from "@tiptap/extension-ruby-text";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle, TextStyleKit } from "@tiptap/extension-text-style";
import Twitch from "@tiptap/extension-twitch";
import Typography from "@tiptap/extension-typography";
import UniqueID from "@tiptap/extension-unique-id";
import Youtube from "@tiptap/extension-youtube";
import { Markdown } from "@tiptap/markdown";
import type {
	AnyExtension,
	JSONContent,
	MarkdownRendererHelpers,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import { Marked } from "marked";
import { escapeHtml } from "@/lib/conventions";
import { CaptionedImage } from "./image";
import { MentionNode, Variable } from "./nodes";

export const lowlight = createLowlight(common);

/** Block types that get a `data-uid` from UniqueID. */
export const UNIQUE_ID_TYPES = [
	"paragraph",
	"heading",
	"blockquote",
	"codeBlock",
	"bulletList",
	"orderedList",
	"taskList",
	"table",
	"image",
	"details",
	"horizontalRule",
	"blockMath",
	"youtube",
	"audio",
	"twitch",
];

/**
 * Marks with no markdown syntax are written as inline HTML so the markdown
 * export keeps them; @tiptap/markdown parses inline HTML back through the
 * schema's parseHTML rules on import.
 */
function htmlMark(
	tag: string,
	attrs: (node: JSONContent) => string = () => "",
) {
	return (node: JSONContent, helpers: MarkdownRendererHelpers) => {
		const extra = attrs(node);
		return `<${tag}${extra}>${helpers.renderChildren(node)}</${tag}>`;
	};
}

const TEXT_STYLE_CSS = {
	color: "color",
	backgroundColor: "background-color",
	fontFamily: "font-family",
	fontSize: "font-size",
	lineHeight: "line-height",
} as const;

function textStyleCss(attrs: JSONContent["attrs"]): string {
	return Object.entries(TEXT_STYLE_CSS)
		.filter(([key]) => attrs?.[key])
		.map(([key, css]) => `${css}: ${attrs?.[key]}`)
		.join("; ");
}

const MarkdownTextStyle = TextStyle.extend({
	renderMarkdown: (node, helpers) => {
		const style = textStyleCss(node.attrs);
		const inner = helpers.renderChildren(node);
		return style ? `<span style="${escapeHtml(style)}">${inner}</span>` : inner;
	},
});

const MarkdownHighlight = Highlight.extend({
	// `==text==` has no colour; a coloured highlight falls back to <mark>.
	renderMarkdown: (node, helpers) => {
		const color = node.attrs?.color as string | undefined;
		const inner = helpers.renderChildren(node);
		return color
			? `<mark data-color="${escapeHtml(color)}" style="background-color: ${escapeHtml(color)}">${inner}</mark>`
			: `==${inner}==`;
	},
});

export type SchemaOverrides = Partial<
	Record<"variable" | "mention" | "emoji" | "mathematics", AnyExtension>
>;

/**
 * The document schema + markdown/HTML serializers, shared by the editor,
 * the static renderer and the unit tests. Editor-only behaviour (suggestion
 * popups, node views, find & replace, focus…) is layered on in `editor-extensions.tsx`.
 */
export function schemaExtensions(
	overrides: SchemaOverrides = {},
): AnyExtension[] {
	return [
		StarterKit.configure({
			codeBlock: false,
			// Lists come from ListKit below (adds task lists + list keymap).
			bulletList: false,
			orderedList: false,
			listItem: false,
			listKeymap: false,
			link: {
				openOnClick: false,
				autolink: true,
				defaultProtocol: "https",
			},
		}),
		ListKit.configure({ taskItem: { nested: true } }),
		CodeBlockLowlight.configure({ lowlight, defaultLanguage: null }),
		TableKit.configure({ table: { resizable: true } }),
		CaptionedImage.configure({
			allowBase64: true,
			resize: {
				enabled: true,
				directions: ["top-left", "top-right", "bottom-left", "bottom-right"],
				minWidth: 80,
				minHeight: 40,
				alwaysPreserveAspectRatio: true,
			},
		}),
		TextAlign.configure({ types: ["heading", "paragraph"] }),
		MarkdownHighlight.configure({ multicolor: true }),
		TextStyleKit.configure({ textStyle: false }),
		MarkdownTextStyle,
		Subscript.extend({ renderMarkdown: htmlMark("sub") }),
		Superscript.extend({ renderMarkdown: htmlMark("sup") }),
		RubyText.extend({
			renderMarkdown: (node, helpers) =>
				`<ruby>${helpers.renderChildren(node)}<rt>${escapeHtml(String(node.attrs?.rt ?? ""))}</rt></ruby>`,
		}),
		Typography,
		Details.configure({ persist: true }),
		DetailsSummary,
		DetailsContent,
		overrides.mathematics ??
			Mathematics.configure({ katexOptions: { throwOnError: false } }),
		overrides.emoji ??
			Emoji.configure({ emojis: gitHubEmojis, enableEmoticons: true }),
		Youtube.configure({ nocookie: true, width: 640, height: 360 }),
		Audio.configure({ allowBase64: true, preload: "metadata" }),
		Twitch.configure({
			// Twitch embeds refuse to load unless `parent` is the embedding host.
			parent:
				typeof window === "undefined" ? "localhost" : window.location.hostname,
			width: 640,
			height: 360,
		}),
		UniqueID.configure({
			attributeName: "uid",
			types: UNIQUE_ID_TYPES,
			generateID: () => crypto.randomUUID().slice(0, 8),
		}),
		overrides.variable ?? Variable,
		overrides.mention ?? MentionNode,
		// A fresh Marked per editor: @tiptap/markdown registers its tokenizers on the
		// instance it is given, so the global `marked` would pile them up on every remount.
		Markdown.configure({
			marked: new Marked() as unknown as typeof import("marked").marked,
			indentation: { style: "space", size: 2 },
		}),
	];
}
