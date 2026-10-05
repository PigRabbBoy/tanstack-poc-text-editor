import { Check, Minus } from "lucide-react";
import type { EditorMeta } from "@/editors/types";

/** Lists every official tool of the editor and whether this page includes it. */
export function ToolInventory({ meta }: { meta: EditorMeta }) {
	const included = meta.inventory.filter((tool) => tool.status === "included");
	const excluded = meta.inventory.filter((tool) => tool.status === "excluded");
	if (meta.inventory.length === 0) return null;

	return (
		<details className="rounded-xl border bg-card" data-testid="tool-inventory">
			<summary className="cursor-pointer px-4 py-3 font-label text-sm font-semibold">
				{meta.name} tools: {included.length} of {meta.inventory.length} on this
				page
			</summary>
			<div className="grid gap-4 border-t p-4 text-sm md:grid-cols-2">
				<ul className="space-y-2">
					{included.map((tool) => (
						<li key={tool.name} className="flex gap-2">
							<Check className="mt-0.5 size-4 shrink-0 text-success-text" />
							<span>
								<span className="font-medium">{tool.name}</span>
								{tool.source && (
									<code className="ml-1 text-xs text-muted-foreground">
										{tool.source}
									</code>
								)}
								{tool.howTo && (
									<span className="block text-xs text-muted-foreground">
										{tool.howTo}
									</span>
								)}
							</span>
						</li>
					))}
				</ul>
				{excluded.length > 0 && (
					<ul className="space-y-2">
						{excluded.map((tool) => (
							<li key={tool.name} className="flex gap-2 text-muted-foreground">
								<Minus className="mt-0.5 size-4 shrink-0" />
								<span>
									<span className="font-medium text-foreground">
										{tool.name}
									</span>
									{tool.reason && (
										<span className="block text-xs">{tool.reason}</span>
									)}
								</span>
							</li>
						))}
					</ul>
				)}
			</div>
		</details>
	);
}
