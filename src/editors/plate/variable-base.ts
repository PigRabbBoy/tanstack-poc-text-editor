import { createSlatePlugin, type TElement } from "platejs";

/** Slate node type of the `{{variable}}` chip. */
export const VARIABLE_KEY = "variable";
/** Transient inline element that hosts the `{{` picker while typing. */
export const VARIABLE_INPUT_KEY = "variable_input";

export type TVariableElement = TElement & {
	type: typeof VARIABLE_KEY;
	name: string;
};

/** BML chip styling shared by the editable and static variable nodes. */
export const VARIABLE_CHIP_CLASS =
	"mx-0.5 inline-block rounded-sm bg-muted px-1.5 py-0.5 align-baseline font-label font-medium text-[0.85em] text-primary-text leading-tight";

export function createVariableNode(name: string): TVariableElement {
	return { type: VARIABLE_KEY, name, children: [{ text: "" }] };
}

/**
 * Inline + void element: the chip is atomic (one cursor step, deleted as a
 * unit) and carries the variable name as data instead of editable text.
 * Used by the static (HTML / Rendered) editor and as the base of the React plugin.
 */
export const BaseVariablePlugin = createSlatePlugin({
	key: VARIABLE_KEY,
	node: { isElement: true, isInline: true, isVoid: true },
});
