import { $isHorizontalRuleNode } from "@lexical/extension";
import {
	CHECK_LIST,
	ELEMENT_TRANSFORMERS,
	type ElementTransformer,
	MULTILINE_ELEMENT_TRANSFORMERS,
	TEXT_FORMAT_TRANSFORMERS,
	TEXT_MATCH_TRANSFORMERS,
	type TextMatchTransformer,
	type Transformer,
} from "@lexical/markdown";
import { type TextFormatType, TextNode } from "lexical";
import {
	$createMentionNode,
	$isMentionNode,
	MentionNode,
} from "@/editors/lexical/components/editor/nodes/mention-node";
import {
	$isSpecialTextNode,
	SpecialTextNode,
} from "@/editors/lexical/components/editor/nodes/special-text-node";
import { EMOJI } from "@/editors/lexical/components/editor/transformers/emoji-transformer";
import { HR as REGISTRY_HR } from "@/editors/lexical/components/editor/transformers/horizontal-rule-transformer";
import { IMAGE } from "@/editors/lexical/components/editor/transformers/image-transformer";
import { createTableTransformer } from "@/editors/lexical/components/editor/transformers/table-transformer";
import {
	$isInlineImageNode,
	InlineImageNode,
} from "@/editors/lexical/components/playground/inline-image";
import {
	$createPageBreakNode,
	$isPageBreakNode,
	PageBreakNode,
} from "@/editors/lexical/components/playground/page-break";
import { mentionMarkdown, variableMarkdown } from "@/lib/conventions";
import {
	$createVariableNode,
	$isVariableNode,
	VariableNode,
} from "./variable-node";

/** `[@Label](mention:id)` — must run before Lexical's LINK transformer. */
export const MENTION: TextMatchTransformer = {
	dependencies: [MentionNode],
	export: (node, _exportChildren, exportFormat) => {
		if (!$isMentionNode(node)) return null;
		const markdown = mentionMarkdown(node.getMentionId(), node.getMention());
		// Let Lexical open/close bold/italic tags shared with neighbouring text.
		return node.getFormat() === 0 ? markdown : exportFormat(node, markdown);
	},
	importRegExp: /\[@([^\]]+)\]\(mention:([\w-]+)\)/,
	regExp: /\[@([^\]]+)\]\(mention:([\w-]+)\)$/,
	replace: (textNode, match) => {
		const [, label = "", id = ""] = match;
		const mention = $createMentionNode(label, id);
		mention.setFormat(textNode.getFormat());
		textNode.replace(mention);
	},
	trigger: ")",
	type: "text-match",
};

// DecoratorTextNode is not a TextNode, so Lexical's exportFormat cannot wrap
// it; wrap the formats markdown can express ourselves.
const FORMAT_TAGS: [TextFormatType, string][] = [
	["bold", "**"],
	["italic", "*"],
	["strikethrough", "~~"],
];

/** `{{name}}` — atomic variable chip. Typing the closing `}}` converts too. */
export const VARIABLE: TextMatchTransformer = {
	dependencies: [VariableNode],
	export: (node) => {
		if (!$isVariableNode(node)) return null;
		const tags = FORMAT_TAGS.filter(([format]) => node.hasFormat(format)).map(
			([, tag]) => tag,
		);
		return `${tags.join("")}${variableMarkdown(node.getName())}${tags.reverse().join("")}`;
	},
	importRegExp: /\{\{([a-z_][a-z0-9_]*)\}\}/,
	regExp: /\{\{([a-z_][a-z0-9_]*)\}\}$/,
	replace: (textNode, match) => {
		const variable = $createVariableNode(match[1] ?? "");
		if (textNode instanceof TextNode) variable.setFormat(textNode.getFormat());
		textNode.replace(variable);
	},
	trigger: "}",
	type: "text-match",
};

/** The registry exports `***`; the shared sample uses `---`. */
const HR: ElementTransformer = {
	...REGISTRY_HR,
	export: (node) => ($isHorizontalRuleNode(node) ? "---" : null),
};

const NEVER = /(?!)/;

/**
 * Special text is opt-in and created by a node transform from `[text] `, so
 * markdown only needs the export side: keep the brackets it was typed with.
 */
export const SPECIAL_TEXT: TextMatchTransformer = {
	dependencies: [SpecialTextNode],
	export: (node) =>
		$isSpecialTextNode(node) ? `[${node.getTextContent()}]` : null,
	importRegExp: NEVER,
	regExp: NEVER,
	replace: () => {},
	type: "text-match",
};

/** Playground inline images export as plain markdown images (position/caption are lost). */
export const INLINE_IMAGE: TextMatchTransformer = {
	dependencies: [InlineImageNode],
	export: (node) =>
		$isInlineImageNode(node)
			? `![${node.getAltText()}](${node.getSrc()})`
			: null,
	importRegExp: NEVER,
	regExp: NEVER,
	replace: () => {},
	type: "text-match",
};

/** `<!-- pagebreak -->` on its own line ⇄ PageBreakNode. */
export const PAGE_BREAK: ElementTransformer = {
	dependencies: [PageBreakNode],
	export: (node) => ($isPageBreakNode(node) ? "<!-- pagebreak -->" : null),
	regExp: /^<!--\s*pagebreak\s*-->\s?$/,
	replace: (parentNode) => {
		parentNode.replace($createPageBreakNode());
	},
	type: "element",
};

/** Inline transformers our nodes need, ahead of Lexical's LINK. */
const INLINE_TRANSFORMERS: Transformer[] = [
	MENTION,
	VARIABLE,
	IMAGE,
	INLINE_IMAGE,
	EMOJI,
	SPECIAL_TEXT,
];

const BASE_TRANSFORMERS: Transformer[] = [
	HR,
	PAGE_BREAK,
	...INLINE_TRANSFORMERS,
	CHECK_LIST,
	...ELEMENT_TRANSFORMERS,
	...MULTILINE_ELEMENT_TRANSFORMERS,
	...TEXT_FORMAT_TRANSFORMERS,
	...TEXT_MATCH_TRANSFORMERS,
];

/** Table cells get the same inline transformers so `**{{amount}}**` becomes a chip. */
export const TABLE = createTableTransformer([
	...INLINE_TRANSFORMERS,
	CHECK_LIST,
	...ELEMENT_TRANSFORMERS,
	...MULTILINE_ELEMENT_TRANSFORMERS,
	...TEXT_FORMAT_TRANSFORMERS,
	...TEXT_MATCH_TRANSFORMERS,
]);

export const EDITOR_TRANSFORMERS: Transformer[] = [TABLE, ...BASE_TRANSFORMERS];
