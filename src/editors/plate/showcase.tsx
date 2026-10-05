import { FlaskConical, Sparkles } from "lucide-react";
import type { Descendant } from "platejs";
import type { PlateEditor } from "platejs/react";
import { lazy, Suspense, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VersionHistory } from "./lab/version-history";
import { meta } from "./meta";
import { createVariableNode } from "./variable-base";

const PlateLab = lazy(() => import("./lab/plate-lab"));

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

/** Single-purpose editors for tools that need a document of their own. */
function LabSection() {
	const [open, setOpen] = useState(false);
	return (
		<details
			className="min-w-0 rounded-xl border bg-card p-4 text-sm"
			data-testid="plate-lab"
			onToggle={(event) => setOpen(event.currentTarget.open)}
		>
			<summary className="cursor-pointer font-label font-semibold">
				<FlaskConical className="mr-1 inline size-4" /> Plate lab — classic
				lists, tags, single-line, forced layout, markdown preview, editable
				voids
			</summary>
			{open && (
				<Suspense fallback={<Skeleton className="mt-3 h-40 w-full" />}>
					<PlateLab />
				</Suspense>
			)}
		</details>
	);
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
			<h3 className="mt-4 mb-2 font-label text-sm font-semibold">
				Version history (@platejs/diff)
			</h3>
			<VersionHistory editor={editor} />
		</details>
	);
}

export function PlateExtras({ editor }: { editor: PlateEditor }) {
	return (
		<>
			<PlateShowcase editor={editor} />
			<LabSection />
		</>
	);
}
