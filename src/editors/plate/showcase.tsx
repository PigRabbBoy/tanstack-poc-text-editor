import { Sparkles } from "lucide-react";
import type { Descendant } from "platejs";
import type { PlateEditor } from "platejs/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { meta } from "./meta";
import { createVariableNode } from "./variable-base";

const TODAY = "2026-10-05";

/** Blocks that only Plate (of the four editors) ships for free. */
export function showcaseBlocks(): Descendant[] {
	const p = (...children: Descendant[]): Descendant => ({
		type: "p",
		children,
	});
	return [
		{ type: "h2", children: [{ text: "Plate showcase" }] },
		{ type: "toc", children: [{ text: "" }] },
		{
			type: "callout",
			icon: "💡",
			children: [
				{
					text: "Right-click any block for the block menu, select text to comment or suggest, drag the ⠿ handle to move blocks into columns.",
				},
			],
		},
		{
			type: "column_group",
			children: [
				{
					type: "column",
					width: "50%",
					children: [
						p(
							{ text: "Left column: payable to " },
							createVariableNode("customer_name"),
							{ text: " by " },
							{ type: "date", date: TODAY, children: [{ text: "" }] },
							{ text: "." },
						),
					],
				},
				{
					type: "column",
					width: "50%",
					children: [
						p(
							{ text: "Right column: " },
							{ text: "font colour", color: "#E91E63" },
							{ text: ", " },
							{ text: "highlight", highlight: true },
							{ text: ", " },
							{ text: "⌘K", kbd: true },
							{ text: " and inline math " },
							{
								type: "inline_equation",
								texExpression: "E = mc^2",
								children: [{ text: "" }],
							},
							{ text: "." },
						),
					],
				},
			],
		},
		{ type: "toggle", children: [{ text: "Toggle: payment terms (click ▸)" }] },
		{
			type: "p",
			indent: 1,
			children: [
				{
					text: "50% on signature, 50% on delivery. Toggles are indent-based in Plate.",
				},
			],
		},
		{
			type: "equation",
			texExpression: "\\text{VAT} = 0.07 \\times \\text{amount}",
			children: [{ text: "" }],
		},
		{
			type: "code_drawing",
			data: {
				drawingType: "Mermaid",
				drawingMode: "Both",
				code: "graph LR\n  Draft --> Review --> Signed",
			},
			children: [{ text: "" }],
		},
	];
}

export function PlateShowcase({ editor }: { editor: PlateEditor }) {
	function insertShowcase() {
		editor.tf.insertNodes(showcaseBlocks(), { at: [editor.children.length] });
		toast.success("Inserted Plate showcase blocks at the end");
	}

	return (
		<details
			className="rounded-xl border bg-card p-4 text-sm"
			data-testid="plate-showcase"
		>
			<summary className="cursor-pointer font-label font-semibold">
				Plate showcase — what only this editor does here
			</summary>
			<ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
				{meta.showcase.map((item) => (
					<li key={item}>{item}</li>
				))}
			</ul>
			<Button
				className="mt-3"
				size="sm"
				variant="outline"
				onClick={insertShowcase}
				data-testid="plate-insert-showcase"
			>
				<Sparkles /> Insert showcase blocks
			</Button>
		</details>
	);
}
