import Mention from "@tiptap/extension-mention";
import {
	InputRule,
	type JSONContent,
	type MarkdownParseHelpers,
	type MarkdownToken,
	mergeAttributes,
	Node,
	PasteRule,
	type RenderContext,
} from "@tiptap/react";
import { mentionMarkdown, variableMarkdown } from "@/lib/conventions";

/**
 * @tiptap/markdown only applies marks to text nodes, so `**{{amount}}**` would
 * lose its bold. Our tokenizers therefore also accept a single wrapping
 * emphasis delimiter around an atom and put the mark on the node itself.
 */
const WRAPPERS = { "**": "bold", "*": "italic", "~~": "strike" } as const;
type Wrapper = keyof typeof WRAPPERS;
const WRAP = String.raw`(\*\*|\*|~~)?`;

function wrappedStart(src: string, opener: string): number {
	const plain = src.indexOf(opener);
	if (plain < 0) return -1;
	for (const wrapper of Object.keys(WRAPPERS)) {
		const wrapped = src.indexOf(wrapper + opener);
		if (wrapped >= 0 && wrapped < plain && wrapped + wrapper.length === plain)
			return wrapped;
	}
	return plain;
}

function atomWithMarks(
	helpers: MarkdownParseHelpers,
	type: string,
	attrs: Record<string, unknown>,
	wrapper: Wrapper | undefined,
): JSONContent {
	const node = helpers.createNode(type, attrs);
	return wrapper ? { ...node, marks: [{ type: WRAPPERS[wrapper] }] } : node;
}

function wrapWithMarks(
	markdown: string,
	node: JSONContent,
	ctx: RenderContext | undefined,
): string {
	const previous = new Set(ctx?.previousNode?.marks?.map((mark) => mark.type));
	for (const [wrapper, mark] of Object.entries(WRAPPERS)) {
		// When the previous text shares the mark the serializer re-opens it itself.
		if (node.marks?.some((m) => m.type === mark) && !previous.has(mark))
			return `${wrapper}${markdown}${wrapper}`;
	}
	return markdown;
}

function token(match: RegExpExecArray, fields: Record<string, string>) {
	return { raw: match[0], wrapper: match[1] as Wrapper | undefined, ...fields };
}

export type AtomToken = MarkdownToken & { wrapper?: Wrapper };

/**
 * `{{name}}` template variable: an atomic inline node.
 * HTML:     <span data-type="variable" data-name="customer_name">{{customer_name}}</span>
 * Markdown: {{customer_name}}
 */
export const Variable = Node.create({
	name: "variable",
	group: "inline",
	inline: true,
	atom: true,
	selectable: true,
	draggable: false,

	addAttributes() {
		return {
			name: {
				default: null,
				parseHTML: (element) => element.getAttribute("data-name"),
				renderHTML: (attributes) =>
					attributes.name ? { "data-name": attributes.name } : {},
			},
		};
	},

	parseHTML() {
		return [{ tag: 'span[data-type="variable"]' }];
	},

	renderHTML({ node, HTMLAttributes }) {
		return [
			"span",
			mergeAttributes({ "data-type": "variable" }, HTMLAttributes),
			variableMarkdown(String(node.attrs.name ?? "")),
		];
	},

	renderText({ node }) {
		return variableMarkdown(String(node.attrs.name ?? ""));
	},

	// Markdown-style shortcut: typing or pasting `{{name}}` becomes a chip.
	addInputRules() {
		return [
			new InputRule({
				find: /\{\{([a-z_][a-z0-9_]*)\}\}$/,
				handler: ({ state, range, match }) => {
					state.tr.replaceWith(
						range.from,
						range.to,
						this.type.create({ name: match[1] }),
					);
				},
			}),
		];
	},

	addPasteRules() {
		return [
			new PasteRule({
				find: /\{\{([a-z_][a-z0-9_]*)\}\}/g,
				handler: ({ state, range, match }) => {
					state.tr.replaceWith(
						range.from,
						range.to,
						this.type.create({ name: match[1] }),
					);
				},
			}),
		];
	},

	markdownTokenName: "variable",
	markdownTokenizer: {
		name: "variable",
		level: "inline",
		start: (src: string) => wrappedStart(src, "{{"),
		tokenize: (src: string) => {
			const match = new RegExp(
				String.raw`^${WRAP}\{\{([a-z_][a-z0-9_]*)\}\}`,
			).exec(src);
			if (!match || (match[1] && !src.startsWith(match[1], match[0].length)))
				return undefined;
			const result = token(match, { type: "variable", name: match[2] ?? "" });
			result.raw += match[1] ?? "";
			return result;
		},
	},
	parseMarkdown: (t: AtomToken, helpers) =>
		atomWithMarks(helpers, "variable", { name: t.name }, t.wrapper),
	renderMarkdown: (node: JSONContent, _helpers, ctx) =>
		wrapWithMarks(variableMarkdown(String(node.attrs?.name ?? "")), node, ctx),
});

/**
 * Official Mention node, re-wired to the shared conventions:
 * HTML     <span data-type="mention" data-id="u1">@สมชาย ใจดี</span>
 * Markdown [@สมชาย ใจดี](mention:u1)   (Tiptap's default is `[@ id="u1" label="…"]`)
 */
export const MentionNode = Mention.extend({
	addAttributes() {
		return {
			id: {
				default: null,
				parseHTML: (element) => element.getAttribute("data-id"),
				renderHTML: (attributes) =>
					attributes.id ? { "data-id": attributes.id } : {},
			},
			label: {
				default: null,
				parseHTML: (element) =>
					element.getAttribute("data-label") ??
					element.textContent?.replace(/^@/, "") ??
					null,
				// Label is the element's text; keep the HTML on the shared form.
				rendered: false,
			},
			mentionSuggestionChar: { default: "@", rendered: false },
		};
	},

	markdownTokenName: "mention",
	markdownTokenizer: {
		name: "mention",
		level: "inline",
		start: (src: string) => wrappedStart(src, "[@"),
		tokenize: (src: string) => {
			const match = new RegExp(
				String.raw`^${WRAP}\[@([^\]]+)\]\(mention:([\w-]+)\)`,
			).exec(src);
			if (!match || (match[1] && !src.startsWith(match[1], match[0].length)))
				return undefined;
			const result = token(match, {
				type: "mention",
				label: match[2] ?? "",
				id: match[3] ?? "",
			});
			result.raw += match[1] ?? "";
			return result;
		},
	},
	parseMarkdown: (t: AtomToken, helpers) =>
		atomWithMarks(helpers, "mention", { id: t.id, label: t.label }, t.wrapper),
	renderMarkdown: (node: JSONContent, _helpers, ctx) => {
		const id = String(node.attrs?.id ?? "");
		return wrapWithMarks(
			mentionMarkdown(id, String(node.attrs?.label ?? id)),
			node,
			ctx,
		);
	},
});
