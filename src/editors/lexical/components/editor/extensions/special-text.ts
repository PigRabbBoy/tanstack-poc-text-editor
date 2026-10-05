import { effect, namedSignals } from "@lexical/extension";
import { defineExtension, safeCast, TextNode } from "lexical";

import {
	$createSpecialTextNode,
	SpecialTextNode,
} from "@/editors/lexical/components/editor/nodes/special-text-node";

/**
 * POC change: the registry matched any `[text]`, which turned the label of a
 * typed markdown link `[docs](…)` or mention `[@Name](mention:id)` into a
 * special-text node before the `(` arrived. Now `[text]` only converts once a
 * whitespace follows the `]`, never for `[@…]`, `[ ]`/`[x]` (task syntax) or a
 * bracket followed by `(`; and the extension is opt-in through a `disabled`
 * signal (default true), like the playground's SpecialTextExtension.
 */
const BRACKETED_TEXT_REGEX = /\[([^[\]@\s][^[\]]*)\](?=\s)/;

function $findAndTransformText(node: TextNode): TextNode | null {
	const match = BRACKETED_TEXT_REGEX.exec(node.getTextContent());
	if (match === null || match[1] === undefined || /^[xX ]$/.test(match[1])) {
		return null;
	}

	const targetNode =
		match.index === 0
			? node.splitText(match.index + match[0].length)[0]
			: node.splitText(match.index, match.index + match[0].length)[1];

	const specialTextNode = $createSpecialTextNode(match[1]);
	targetNode.replace(specialTextNode);
	return specialTextNode;
}

function $specialTextNodeTransform(node: TextNode): void {
	let targetNode: TextNode | null = node;

	while (targetNode !== null) {
		if (!targetNode.isSimpleText()) {
			return;
		}

		targetNode = $findAndTransformText(targetNode);
	}
}

export interface SpecialTextConfig {
	disabled: boolean;
}

export const SpecialTextExtension = defineExtension({
	name: "@shadcn-editor/editor/SpecialText",
	build: (_editor, config) => namedSignals(config),
	config: safeCast<SpecialTextConfig>({ disabled: true }),
	nodes: () => [SpecialTextNode],
	register: (editor, _config, state) =>
		effect(() => {
			if (state.getOutput().disabled.value) {
				return;
			}
			return editor.registerNodeTransform(TextNode, $specialTextNodeTransform);
		}),
});
