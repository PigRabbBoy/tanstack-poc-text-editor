import { DOMImportExtension, defineImportRule, sel } from "@lexical/html";
import { configExtension, defineExtension } from "lexical";
import { $createMentionNode } from "@/editors/lexical/components/editor/nodes/mention-node";
import { $createVariableNode } from "./variable-node";

/**
 * Rules for the extension-based HTML import pipeline (@lexical/html
 * DOMImportExtension, used by HTML paste and the "Edit as HTML" round-trip).
 * Legacy `importDOM` on our nodes only covers `$generateNodesFromDOM`.
 */
const VariableImportRule = defineImportRule({
	name: "@poc/lexical/variable",
	match: sel.tag("span").attr("data-type", "variable"),
	$import: (_ctx, element, $next) => {
		const name = element.getAttribute("data-name");
		return name ? [$createVariableNode(name)] : $next();
	},
});

const MentionImportRule = defineImportRule({
	name: "@poc/lexical/mention",
	match: sel.tag("span").attr("data-type", "mention"),
	$import: (_ctx, element, $next) => {
		const id = element.getAttribute("data-id");
		const label = (element.textContent ?? "").replace(/^@/, "");
		return id ? [$createMentionNode(label, id)] : $next();
	},
});

export const ConventionsImportExtension = defineExtension({
	name: "@poc/lexical/conventions-html-import",
	dependencies: [
		configExtension(DOMImportExtension, {
			rules: [VariableImportRule, MentionImportRule],
		}),
	],
});
