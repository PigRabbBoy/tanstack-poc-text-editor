import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { VARIABLES } from "@/data/variables";
import { cn } from "@/lib/utils";

export const chipClassName =
	"inline-flex items-center rounded-sm bg-muted px-1.5 py-px align-baseline font-label text-[0.85em] font-semibold leading-snug text-primary-text";

export function variableTitle(name: string): string {
	const variable = VARIABLES.find((item) => item.name === name);
	return variable
		? `${variable.label} — e.g. ${variable.sample}`
		: `Unknown variable “${name}”`;
}

/** Atomic `{{name}}` chip shown inside the editor (ReactNodeViewRenderer). */
export function VariableChip({ node, selected }: ReactNodeViewProps) {
	const name = String(node.attrs.name ?? "");
	const known = VARIABLES.some((item) => item.name === name);
	return (
		<NodeViewWrapper
			as="span"
			data-type="variable"
			data-name={name}
			title={variableTitle(name)}
			className={cn(
				chipClassName,
				"cursor-default select-none",
				!known && "bg-destructive/10 text-destructive",
				selected && "ring-2 ring-ring",
			)}
		>
			{`{{${name}}}`}
		</NodeViewWrapper>
	);
}
