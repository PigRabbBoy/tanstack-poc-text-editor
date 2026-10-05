import type { TextMatchTransformer } from "@lexical/markdown";

import {
	$createImageNode,
	$isImageNode,
	ImageNode,
} from "@/editors/lexical/components/editor/nodes/image-node";

export const IMAGE: TextMatchTransformer = {
	dependencies: [ImageNode],
	export: (node) => {
		if (!$isImageNode(node)) {
			return null;
		}
		return `![${node.getAltText()}](${node.getSrc()})`;
	},
	importRegExp: /!(?:\[([^[]*)\])(?:\(([^(]+)\))/,
	regExp: /!(?:\[([^[]*)\])(?:\(([^(]+)\))$/,
	replace: (textNode, match) => {
		const [, altText, src] = match;
		textNode.replace($createImageNode({ altText, src }));
	},
	trigger: ")",
	type: "text-match",
};
