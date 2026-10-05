import {
	getExtensionDependencyFromEditor,
	getPeerDependencyFromEditor,
} from "@lexical/extension";
import {
	type MdastExportRule,
	MdastExtension,
	type MdastImportRule,
	type PhrasingContent,
} from "@lexical/mdast";
import {
	$isTextNode,
	configExtension,
	defineExtension,
	type LexicalEditor,
	type LexicalNode,
} from "lexical";
import {
	$createMentionNode,
	$isMentionNode,
	MentionNode,
} from "@/editors/lexical/components/editor/nodes/mention-node";
import { MENTION_HREF_PREFIX, VARIABLE_PATTERN } from "@/lib/conventions";
import {
	$createVariableNode,
	$isVariableNode,
	VariableNode,
} from "./variable-node";

type Link = Extract<PhrasingContent, { type: "link" }>;
type Text = Extract<PhrasingContent, { type: "text" }>;

/** `[@Label](mention:id)` mdast links become MentionNodes. */
const mentionImport: MdastImportRule = {
	type: "link",
	$import: (node: Link, context) => {
		if (!node.url.startsWith(MENTION_HREF_PREFIX)) return context.next();
		const label = node.children
			.map((child) => ("value" in child ? child.value : ""))
			.join("")
			.replace(/^@/, "");
		return $createMentionNode(
			label,
			node.url.slice(MENTION_HREF_PREFIX.length),
		);
	},
};

/** `{{name}}` inside mdast text becomes VariableNodes. */
const variableImport: MdastImportRule = {
	type: "text",
	$import: (node: Text, context) => {
		const pattern = new RegExp(VARIABLE_PATTERN.source, "g");
		if (!pattern.test(node.value)) return context.next();
		const nodes: LexicalNode[] = [];
		let last = 0;
		for (const match of node.value.matchAll(pattern)) {
			const index = match.index ?? 0;
			if (index > last) {
				nodes.push(
					...context.createText(node.value.slice(last, index), context.format),
				);
			}
			const variable = $createVariableNode(match[1] ?? "");
			variable.setFormat(context.format);
			nodes.push(variable);
			last = index + match[0].length;
		}
		if (last < node.value.length) {
			nodes.push(...context.createText(node.value.slice(last), context.format));
		}
		return nodes.filter(
			(child) => !$isTextNode(child) || child.getTextContent() !== "",
		);
	},
};

const mentionExport: MdastExportRule = {
	type: MentionNode,
	$export: (node: MentionNode) =>
		$isMentionNode(node)
			? {
					type: "link",
					url: `${MENTION_HREF_PREFIX}${node.getMentionId()}`,
					children: [{ type: "text", value: `@${node.getMention()}` }],
				}
			: null,
};

/** Keeps `**{{amount}}**`: DecoratorTextNode formats map to mdast wrappers. */
const variableExport: MdastExportRule = {
	type: VariableNode,
	$export: (node: VariableNode) => {
		if (!$isVariableNode(node)) return null;
		let content: PhrasingContent = {
			type: "text",
			value: `{{${node.getName()}}}`,
		};
		if (node.hasFormat("strikethrough"))
			content = { type: "delete", children: [content] };
		if (node.hasFormat("italic"))
			content = { type: "emphasis", children: [content] };
		if (node.hasFormat("bold"))
			content = { type: "strong", children: [content] };
		return content;
	},
};

/**
 * Teaches the experimental @lexical/mdast pipeline the shared variable and
 * mention conventions (ADR-0002), so its export can be compared with
 * @lexical/markdown's on the Lab panel and its typing shortcuts can be tried.
 */
export const MdastConventionsExtension = defineExtension({
	name: "@poc/lexical/mdast-conventions",
	dependencies: [
		configExtension(MdastExtension, {
			exportRules: [mentionExport, variableExport],
			importRules: [mentionImport, variableImport],
		}),
	],
});

/** Whole-document markdown via @lexical/mdast (experimental). */
export function exportMdastMarkdown(editor: LexicalEditor): string {
	const output = getExtensionDependencyFromEditor(
		editor,
		MdastExtension,
	).output;
	return editor.read(() => output.$convertToMarkdownString());
}

/** Markdown of the current selection, or null when mdast is not on this editor. */
export function $selectionToMdastMarkdown(
	editor: LexicalEditor,
): string | null {
	const mdast = getPeerDependencyFromEditor<typeof MdastExtension>(
		editor,
		MdastExtension.name,
	);
	return mdast ? mdast.output.$convertSelectionToMarkdownString() : null;
}
