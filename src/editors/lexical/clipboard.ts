import {
	ClipboardImportExtension,
	GetClipboardDataExtension,
} from "@lexical/clipboard";
import {
	$createLineBreakNode,
	$createTextNode,
	$getEditor,
	$isRangeSelection,
	configExtension,
	defineExtension,
	type LexicalNode,
} from "lexical";
import { $createMentionNode } from "@/editors/lexical/components/editor/nodes/mention-node";
import {
	MENTION_PATTERN,
	tokenizeInline,
	VARIABLE_PATTERN,
} from "@/lib/conventions";
import { $selectionToMdastMarkdown } from "./mdast";
import { $createVariableNode } from "./variable-node";

function hasConventionTokens(text: string): boolean {
	return (
		new RegExp(VARIABLE_PATTERN.source).test(text) ||
		new RegExp(MENTION_PATTERN.source).test(text)
	);
}

function $nodesFromPlainText(text: string): LexicalNode[] {
	const nodes: LexicalNode[] = [];
	text.split(/\r?\n/).forEach((line, index) => {
		if (index > 0) nodes.push($createLineBreakNode());
		for (const token of tokenizeInline(line)) {
			if (token.type === "text") nodes.push($createTextNode(token.text));
			else if (token.type === "variable")
				nodes.push($createVariableNode(token.name));
			else nodes.push($createMentionNode(token.label, token.id));
		}
	});
	return nodes;
}

/**
 * Clipboard behaviour for the shared conventions, built on the official
 * @lexical/clipboard extensions:
 * - copy adds a `text/markdown` flavour (via @lexical/mdast) next to
 *   text/plain, text/html and the Lexical JSON;
 * - pasting plain text that contains `{{name}}` or `[@Label](mention:id)`
 *   inserts variable chips and mentions instead of literal text.
 */
export const ClipboardConventionsExtension = defineExtension({
	name: "@poc/lexical/clipboard-conventions",
	dependencies: [
		configExtension(GetClipboardDataExtension, {
			$exportMimeType: {
				"text/markdown": [
					(selection) =>
						selection === null || selection.isCollapsed()
							? null
							: $selectionToMdastMarkdown($getEditor()),
				],
			},
		}),
		configExtension(ClipboardImportExtension, {
			$importMimeType: {
				"text/plain": [
					(data, selection, $next, dataTransfer) => {
						if (
							dataTransfer.getData("text/html") !== "" ||
							!hasConventionTokens(data) ||
							!$isRangeSelection(selection)
						) {
							return $next();
						}
						selection.insertNodes($nodesFromPlainText(data));
						return true;
					},
				],
			},
		}),
	],
});
