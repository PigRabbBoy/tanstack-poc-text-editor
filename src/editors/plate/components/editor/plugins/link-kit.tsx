"use client";

import { LinkRules } from "@platejs/link";
import { LinkPlugin } from "@platejs/link/react";

import { LinkElement } from "@/editors/plate/ui/link-node";
import { LinkFloatingToolbar } from "@/editors/plate/ui/link-toolbar";

export const LinkKit = [
	LinkPlugin.configure({
		// POC: typing at a link edge extends it only when the caret came from inside.
		rules: { selection: { affinity: "directional" } },
		inputRules: [
			LinkRules.markdown(),
			LinkRules.autolink({ variant: "paste" }),
			LinkRules.autolink({ variant: "space" }),
			LinkRules.autolink({ variant: "break" }),
		],
		render: {
			node: LinkElement,
			afterEditable: () => <LinkFloatingToolbar />,
		},
	}),
];
