"use client";

import {
	BoldRules,
	CodeRules,
	HighlightRules,
	ItalicRules,
	MarkComboRules,
	StrikethroughRules,
	SubscriptRules,
	SuperscriptRules,
	UnderlineRules,
} from "@platejs/basic-nodes";
import {
	BoldPlugin,
	CodePlugin,
	HighlightPlugin,
	ItalicPlugin,
	KbdPlugin,
	StrikethroughPlugin,
	SubscriptPlugin,
	SuperscriptPlugin,
	UnderlinePlugin,
} from "@platejs/basic-nodes/react";

import { CodeLeaf } from "@/editors/plate/ui/code-node";
import { HighlightLeaf } from "@/editors/plate/ui/highlight-node";
import { KbdLeaf } from "@/editors/plate/ui/kbd-node";

export const BasicMarksKit = [
	BoldPlugin.configure({
		inputRules: [
			BoldRules.markdown({ variant: "*" }),
			BoldRules.markdown({ variant: "_" }),
			MarkComboRules.markdown({ variant: "boldItalic" }),
			MarkComboRules.markdown({ variant: "boldUnderline" }),
			MarkComboRules.markdown({ variant: "boldItalicUnderline" }),
			MarkComboRules.markdown({ variant: "italicUnderline" }),
		],
	}),
	ItalicPlugin.configure({
		inputRules: [
			ItalicRules.markdown({ variant: "*" }),
			ItalicRules.markdown({ variant: "_" }),
		],
	}),
	UnderlinePlugin.configure({
		inputRules: [UnderlineRules.markdown()],
	}),
	CodePlugin.configure({
		inputRules: [CodeRules.markdown()],
		node: { component: CodeLeaf },
		// POC: Plugin Rules / AffinityPlugin — a hard edge lets the caret step
		// just outside inline code with the arrow keys (docs: rules.selection).
		rules: { selection: { affinity: "hard" } },
		shortcuts: { toggle: { keys: "mod+e" } },
	}),
	StrikethroughPlugin.configure({
		inputRules: [StrikethroughRules.markdown()],
		shortcuts: { toggle: { keys: "mod+shift+x" } },
	}),
	SubscriptPlugin.configure({
		inputRules: [SubscriptRules.markdown()],
		shortcuts: { toggle: { keys: "mod+comma" } },
	}),
	SuperscriptPlugin.configure({
		inputRules: [SuperscriptRules.markdown()],
		shortcuts: { toggle: { keys: "mod+period" } },
	}),
	HighlightPlugin.configure({
		inputRules: [
			HighlightRules.markdown({ variant: "==" }),
			HighlightRules.markdown({ variant: "≡" }),
		],
		node: { component: HighlightLeaf },
		shortcuts: { toggle: { keys: "mod+shift+h" } },
	}),
	KbdPlugin.withComponent(KbdLeaf),
];
