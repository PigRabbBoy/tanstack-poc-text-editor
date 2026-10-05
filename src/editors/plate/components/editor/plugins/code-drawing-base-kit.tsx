import { BaseCodeDrawingPlugin } from "@platejs/code-drawing";

import { CodeDrawingElementStatic as CodeDrawingElement } from "@/editors/plate/ui/code-drawing-node-static";

export const BaseCodeDrawingKit = [
	BaseCodeDrawingPlugin.configure({
		node: { component: CodeDrawingElement },
	}),
];
