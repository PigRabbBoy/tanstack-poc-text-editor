import {
	createReactStyleSpec,
	useActiveStyles,
	useBlockNoteEditor,
	useComponentsContext,
	usePortalElement,
} from "@blocknote/react";
import { Type } from "lucide-react";
import { createElement } from "react";
import type { AppEditor } from "./schema";

/**
 * The "Font" custom style from BlockNote's custom-style docs
 * (examples/06-custom-schema/03-font-style): a string-valued style rendered as
 * `font-family`. The example prompts for a name; here it is a toolbar select of the
 * Boonmee Lab faces the app already loads.
 */
export const Font = createReactStyleSpec(
	{ type: "font", propSchema: "string" },
	{
		render: ({ value, contentRef }) => (
			<span style={{ fontFamily: value }} ref={contentRef} />
		),
	},
);

export const FONTS = ["Poppins", "Montserrat", "Work Sans", "Anuphan"];

/** Formatting toolbar select that sets or clears the `font` style. */
export function FontSelect() {
	const Components = useComponentsContext();
	const editor = useBlockNoteEditor() as unknown as AppEditor;
	const portalElement = usePortalElement();
	const current = useActiveStyles(editor).font;
	if (!Components) return null;
	// createElement, not JSX: in dev, TanStack's devtools plugin stamps `data-tsd-source`
	// on every JSX element in src/, and BlockNote's Select asserts it gets no extra props
	// ("Object must be empty"), which would crash the toolbar.
	return createElement(Components.FormattingToolbar.Select, {
		className: "bn-select",
		portalElement,
		items: [
			{
				text: "Default font",
				icon: <Type size={16} />,
				isSelected: !current,
				onClick: () => editor.removeStyles({ font: "" }),
			},
			...FONTS.map((font) => ({
				text: font,
				icon: <Type size={16} />,
				isSelected: current === font,
				onClick: () => editor.addStyles({ font }),
			})),
		],
	});
}
