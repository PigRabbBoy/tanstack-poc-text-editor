import type { MdRules } from "@platejs/markdown";
import { KEYS, type TText } from "platejs";
import {
	MENTION_HREF_PREFIX,
	mentionMarkdown,
	variableMarkdown,
} from "@/lib/conventions";
import { createVariableNode, VARIABLE_KEY } from "./variable-base";

/**
 * Markdown ⇄ Plate rules for the shared conventions:
 *
 *   {{customer_name}}          ⇄ { type: "variable", name }
 *   [@Suda Rakthai](mention:u2) ⇄ { type: "mention", key: "u2", value: "Suda Rakthai" }
 *
 * Plate's own `remarkMention` would also turn bare `@word` text into mentions and
 * keeps the `@` in the label, so we use our own remark plugin instead.
 */

type MdNode = {
	type: string;
	value?: string;
	url?: string;
	children?: MdNode[];
	[key: string]: unknown;
};

const TEXT_VARIABLE = /\{\{([a-z_][a-z0-9_]*)\}\}/g;
/** With remark-mdx, `{{name}}` parses as an expression whose value is `{name}`. */
const EXPRESSION_VARIABLE = /^\s*\{\s*([a-z_][a-z0-9_]*)\s*\}\s*$/;

function plainText(node: MdNode): string {
	if (typeof node.value === "string") return node.value;
	return (node.children ?? []).map(plainText).join("");
}

function splitText(value: string): MdNode[] {
	const parts: MdNode[] = [];
	let last = 0;
	for (const match of value.matchAll(TEXT_VARIABLE)) {
		const index = match.index ?? 0;
		if (index > last)
			parts.push({ type: "text", value: value.slice(last, index) });
		parts.push({ type: VARIABLE_KEY, name: match[1] });
		last = index + match[0].length;
	}
	if (last < value.length)
		parts.push({ type: "text", value: value.slice(last) });
	return parts;
}

function transform(node: MdNode) {
	if (!node.children) return;
	const next: MdNode[] = [];
	for (const child of node.children) {
		if (child.type === "link" && child.url?.startsWith(MENTION_HREF_PREFIX)) {
			next.push({
				type: "mention",
				id: decodeURIComponent(child.url.slice(MENTION_HREF_PREFIX.length)),
				label: plainText(child).replace(/^@/, ""),
			});
			continue;
		}
		if (
			child.type === "mdxTextExpression" ||
			child.type === "mdxFlowExpression"
		) {
			const name = EXPRESSION_VARIABLE.exec(child.value ?? "")?.[1];
			if (name) {
				const variable = { type: VARIABLE_KEY, name };
				next.push(
					child.type === "mdxFlowExpression"
						? { type: "paragraph", children: [variable] }
						: variable,
				);
				continue;
			}
		}
		if (child.type === "text" && child.value?.includes("{{")) {
			next.push(...splitText(child.value));
			continue;
		}
		transform(child);
		next.push(child);
	}
	node.children = next;
}

/** Remark plugin: mention links and `{{name}}` tokens → custom mdast nodes. */
export function remarkTemplateTokens() {
	return (tree: MdNode) => {
		transform(tree);
	};
}

type MarkedText = TText & {
	bold?: boolean;
	italic?: boolean;
	strikethrough?: boolean;
};

/** Inline voids carry marks on their empty text child; re-wrap them on export. */
function wrapMarks(node: MdNode, text: MarkedText | undefined): MdNode {
	let result = node;
	if (text?.strikethrough) result = { type: "delete", children: [result] };
	if (text?.italic) result = { type: "emphasis", children: [result] };
	if (text?.bold) result = { type: "strong", children: [result] };
	return result;
}

function marksFromDeco(deco: Record<string, unknown>) {
	const marks: Record<string, true> = {};
	for (const key of [KEYS.bold, KEYS.italic, KEYS.strikethrough]) {
		if (deco[key]) marks[key] = true;
	}
	return marks;
}

export const templateMarkdownRules: MdRules = {
	[VARIABLE_KEY]: {
		deserialize: (node: MdNode, deco) => ({
			...createVariableNode(String(node.name)),
			children: [{ text: "", ...marksFromDeco(deco) }],
		}),
		// `html` is printed verbatim, so the braces are not escaped by remark-mdx.
		serialize: (node: { name: string; children: MarkedText[] }) =>
			wrapMarks(
				{ type: "html", value: variableMarkdown(node.name) },
				node.children[0],
			),
	},
	mention: {
		deserialize: (node: MdNode, deco) => ({
			type: KEYS.mention,
			key: String(node.id),
			value: String(node.label),
			children: [{ text: "", ...marksFromDeco(deco) }],
		}),
		serialize: (node) =>
			wrapMarks(
				// Printed as html too: remark would otherwise escape characters in labels.
				{
					type: "html",
					value: mentionMarkdown(String(node.key ?? node.value), node.value),
				},
				node.children[0] as MarkedText,
			),
	},
};
