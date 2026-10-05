import { BracesIcon } from "lucide-react";
import { KEYS, RangeApi, type TComboboxInputElement } from "platejs";
import {
	createPlatePlugin,
	type PlateEditor,
	PlateElement,
	type PlateElementProps,
	toPlatePlugin,
	useFocused,
	useSelected,
} from "platejs/react";
import { useState } from "react";
import { VARIABLES } from "@/data/variables";
import {
	InlineCombobox,
	InlineComboboxContent,
	InlineComboboxEmpty,
	InlineComboboxGroup,
	InlineComboboxGroupLabel,
	InlineComboboxInput,
	InlineComboboxItem,
} from "@/editors/plate/ui/inline-combobox";
import { cn } from "@/lib/utils";
import {
	BaseVariablePlugin,
	createVariableNode,
	type TVariableElement,
	VARIABLE_CHIP_CLASS,
	VARIABLE_INPUT_KEY,
} from "./variable-base";

export function VariableElement(props: PlateElementProps<TVariableElement>) {
	const { element } = props;
	const selected = useSelected();
	const focused = useFocused();
	const known = VARIABLES.some((variable) => variable.name === element.name);

	return (
		<PlateElement
			{...props}
			as="span"
			className={cn(
				VARIABLE_CHIP_CLASS,
				"cursor-default",
				!known && "outline-1 outline-destructive outline-dashed",
				selected && focused && "ring-2 ring-ring",
			)}
			attributes={{
				...props.attributes,
				contentEditable: false,
				draggable: true,
				"data-type": "variable",
				"data-name": element.name,
				title: known ? undefined : "Unknown variable",
			}}
		>
			{`{{${element.name}}}`}
			{props.children}
		</PlateElement>
	);
}

export function VariableInputElement(
	props: PlateElementProps<TComboboxInputElement>,
) {
	const { editor, element } = props;
	const [search, setSearch] = useState("");

	return (
		<PlateElement {...props} as="span">
			<InlineCombobox
				element={element}
				setValue={setSearch}
				trigger="{{"
				value={search}
			>
				<span className="inline-block rounded-sm bg-muted px-1 font-label text-primary-text">
					<InlineComboboxInput data-testid="variable-input" />
				</span>
				<InlineComboboxContent className="my-1.5">
					<InlineComboboxEmpty>No variables</InlineComboboxEmpty>
					<InlineComboboxGroup>
						<InlineComboboxGroupLabel>Variables</InlineComboboxGroupLabel>
						{VARIABLES.map((variable) => (
							<InlineComboboxItem
								key={variable.name}
								value={variable.name}
								label={variable.label}
								keywords={[variable.label, variable.sample]}
								onClick={() => insertVariable(editor, variable.name)}
							>
								<BracesIcon className="mr-2 text-muted-foreground" />
								<span className="font-label text-primary-text">
									{variable.name}
								</span>
								<span className="ml-auto truncate pl-2 text-muted-foreground text-xs">
									{variable.label}
								</span>
							</InlineComboboxItem>
						))}
					</InlineComboboxGroup>
				</InlineComboboxContent>
			</InlineCombobox>
			{props.children}
		</PlateElement>
	);
}

/** Inserts a chip and puts the cursor after it (same dance as Plate's mention). */
export function insertVariable(editor: PlateEditor, name: string) {
	editor.tf.insertNodes(createVariableNode(name), { select: true });
	editor.tf.move({ unit: "offset" });
}

/** Opens the variable picker at the cursor (used by the slash menu and toolbar). */
export function openVariablePicker(editor: PlateEditor) {
	editor.tf.insertNodes(
		{ type: VARIABLE_INPUT_KEY, children: [{ text: "" }] },
		{ select: true },
	);
}

/**
 * Typing `{{` replaces the first brace with the picker. Plate's trigger
 * combobox only matches a single inserted character, so the second `{` is
 * the trigger and the previous character must be `{`.
 */
export const VariablePlugin = toPlatePlugin(BaseVariablePlugin)
	.withComponent(VariableElement)
	.overrideEditor(({ editor, tf: { insertText } }) => ({
		transforms: {
			insertText(text, options) {
				if (
					text === "{" &&
					!options?.at &&
					editor.selection &&
					RangeApi.isCollapsed(editor.selection) &&
					!editor.api.some({
						match: { type: editor.getType(KEYS.codeBlock) },
					})
				) {
					const before = editor.api.range("before", editor.selection);
					if (before && editor.api.string(before) === "{") {
						editor.tf.deleteBackward("character");
						openVariablePicker(editor as PlateEditor);
						return;
					}
				}
				insertText(text, options);
			},
		},
	}));

export const VariableInputPlugin = createPlatePlugin({
	key: VARIABLE_INPUT_KEY,
	node: { isElement: true, isInline: true, isVoid: true },
}).withComponent(VariableInputElement);

export const VariableKit = [VariablePlugin, VariableInputPlugin];
