import type { ReactNode } from "react";
import {
	ForcedLayoutLab,
	SingleBlockLab,
	SingleLineLab,
} from "./constraint-editors";
import { EditableVoidLab } from "./editable-void";
import { PreviewMarkdownLab } from "./preview-markdown";
import { ClassicListLab, TagsLab } from "./tags-and-classic";

function Card({
	title,
	source,
	children,
}: {
	title: string;
	source: string;
	children: ReactNode;
}) {
	return (
		<section className="min-w-0 space-y-2 rounded-lg border bg-background p-3">
			<header className="flex flex-wrap items-baseline justify-between gap-2">
				<h3 className="font-label text-sm font-semibold">{title}</h3>
				<code className="text-xs text-muted-foreground">{source}</code>
			</header>
			{children}
		</section>
	);
}

/**
 * Plate tools that need an editor of their own (they constrain or replace the
 * whole document), each in a small single-purpose editor. Loaded on demand.
 */
export default function PlateLab() {
	return (
		<div
			className="mt-3 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3"
			data-testid="plate-lab-content"
		>
			<Card
				title="List Classic + classic toolbars"
				source="@platejs/list-classic"
			>
				<ClassicListLab />
			</Card>
			<Card title="Multi Select (tags)" source="@platejs/tag · select-editor">
				<TagsLab />
			</Card>
			<Card
				title="Single Line + max length"
				source="SingleLinePlugin · LengthPlugin"
			>
				<SingleLineLab />
			</Card>
			<Card title="Single Block" source="SingleBlockPlugin">
				<SingleBlockLab />
			</Card>
			<Card title="Forced Layout" source="NormalizeTypesPlugin">
				<ForcedLayoutLab />
			</Card>
			<Card title="Preview Markdown (decorations)" source="decorate · prismjs">
				<PreviewMarkdownLab />
			</Card>
			<Card title="Editable Voids" source="createPlatePlugin isVoid">
				<EditableVoidLab />
			</Card>
		</div>
	);
}
