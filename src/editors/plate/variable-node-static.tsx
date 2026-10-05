import type { SlateElementProps } from "platejs/static";
import { SlateElement } from "platejs/static";
import { cn } from "@/lib/utils";
import {
	BaseVariablePlugin,
	type TVariableElement,
	VARIABLE_CHIP_CLASS,
} from "./variable-base";

/**
 * Static chip used by `<PlateStatic>` and `serializeHtml`. It deliberately does
 * not render the void's empty text child, so the exported HTML is exactly the
 * shared convention: `<span data-type="variable" data-name="x">{{x}}</span>`
 * (plus Plate's own data-slate-* attributes and classes).
 */
export function VariableElementStatic(
	props: SlateElementProps<TVariableElement>,
) {
	const { element } = props;
	return (
		<SlateElement
			{...props}
			as="span"
			className={cn(VARIABLE_CHIP_CLASS, props.className)}
			attributes={{
				...props.attributes,
				"data-type": "variable",
				"data-name": element.name,
			}}
		>
			{`{{${element.name}}}`}
		</SlateElement>
	);
}

export const BaseVariableKit = [
	BaseVariablePlugin.withComponent(VariableElementStatic),
];
