import {
	BaseFootnoteDefinitionPlugin,
	BaseFootnoteReferencePlugin,
} from "@platejs/footnote";
import { MarkdownPlugin, remarkMdx } from "@platejs/markdown";
import { KEYS } from "platejs";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import {
	remarkTemplateTokens,
	templateMarkdownRules,
} from "@/editors/plate/markdown-rules";

// POC: Plate's `remarkMention` is replaced by our `remarkTemplateTokens`, which
// parses the shared `[@Label](mention:id)` and `{{variable}}` conventions.
export const MarkdownKit = [
	BaseFootnoteReferencePlugin,
	BaseFootnoteDefinitionPlugin,
	MarkdownPlugin.configure({
		options: {
			plainMarks: [KEYS.suggestion, KEYS.comment],
			// POC: match the sample's style (`*em*`, `-` bullets, `---`, compact tables).
			remarkStringifyOptions: { bullet: "-", emphasis: "*", rule: "-" },
			remarkPlugins: [
				remarkMath,
				function remarkGfmCompactTables(this: any) {
					return (remarkGfm as any).call(this, { tablePipeAlign: false });
				},
				remarkEmoji as any,
				remarkMdx,
				remarkTemplateTokens as any,
			],
			rules: templateMarkdownRules,
		},
	}),
];
