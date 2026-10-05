import { type Editor, useEditorState } from "@tiptap/react";
import { ChevronDown, Rows3 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { keepEditorFocus } from "./controls";

/** Boonmee Lab families first; unstyled text already renders in Work Sans. */
export const FONT_FAMILIES = [
	"Work Sans",
	"Poppins",
	"Montserrat",
	"Anuphan",
	"Arial",
	"Courier New",
	"Georgia",
	"Times New Roman",
	"Trebuchet MS",
	"Verdana",
];

const FONT_SIZES = [
	"12px",
	"14px",
	"16px",
	"18px",
	"20px",
	"24px",
	"30px",
	"36px",
];

const LINE_HEIGHTS = ["1", "1.15", "1.5", "1.8", "2", "2.5"];

const DEFAULT = "default";

type StyleKey = "fontFamily" | "fontSize" | "lineHeight";

function useTextStyle(editor: Editor, key: StyleKey): string {
	return useEditorState({
		editor,
		selector: ({ editor: e }) =>
			String(e.getAttributes("textStyle")[key] ?? DEFAULT),
	});
}

function StyleMenu({
	label,
	trigger,
	value,
	options,
	onChange,
	testId,
	renderOption = (option) => option,
	triggerClassName,
}: {
	label: string;
	trigger: ReactNode;
	value: string;
	options: string[];
	onChange: (value: string) => void;
	testId: string;
	renderOption?: (option: string) => ReactNode;
	triggerClassName?: string;
}) {
	return (
		<DropdownMenu>
			<Tooltip>
				<TooltipTrigger asChild>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							aria-label={label}
							data-testid={testId}
							className={triggerClassName}
							onMouseDown={(event) => event.preventDefault()}
						>
							{trigger}
							<ChevronDown className="opacity-60" />
						</Button>
					</DropdownMenuTrigger>
				</TooltipTrigger>
				<TooltipContent side="bottom">{label}</TooltipContent>
			</Tooltip>
			<DropdownMenuContent
				onCloseAutoFocus={keepEditorFocus}
				align="start"
				className="max-h-[60vh] overflow-y-auto"
			>
				<DropdownMenuLabel className="eyebrow">{label}</DropdownMenuLabel>
				<DropdownMenuRadioGroup value={value} onValueChange={onChange}>
					<DropdownMenuRadioItem value={DEFAULT}>Default</DropdownMenuRadioItem>
					<DropdownMenuSeparator />
					{options.map((option) => (
						<DropdownMenuRadioItem key={option} value={option}>
							{renderOption(option)}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/** FontFamily (TextStyleKit). */
export function FontFamilyMenu({ editor }: { editor: Editor }) {
	const value = useTextStyle(editor, "fontFamily");
	return (
		<StyleMenu
			label="Font family"
			testId="tiptap-font-family"
			triggerClassName="w-28 justify-between font-label"
			trigger={
				<span className="truncate">{value === DEFAULT ? "Font" : value}</span>
			}
			value={value}
			options={FONT_FAMILIES}
			renderOption={(font) => <span style={{ fontFamily: font }}>{font}</span>}
			onChange={(font) =>
				font === DEFAULT
					? editor.chain().focus().unsetFontFamily().run()
					: editor.chain().focus().setFontFamily(font).run()
			}
		/>
	);
}

/** FontSize (TextStyleKit). */
export function FontSizeMenu({ editor }: { editor: Editor }) {
	const value = useTextStyle(editor, "fontSize");
	return (
		<StyleMenu
			label="Font size"
			testId="tiptap-font-size"
			triggerClassName="w-20 justify-between font-label"
			trigger={value === DEFAULT ? "Size" : value}
			value={value}
			options={FONT_SIZES}
			onChange={(size) =>
				size === DEFAULT
					? editor.chain().focus().unsetFontSize().run()
					: editor.chain().focus().setFontSize(size).run()
			}
		/>
	);
}

/** LineHeight (TextStyleKit). */
export function LineHeightMenu({ editor }: { editor: Editor }) {
	const value = useTextStyle(editor, "lineHeight");
	return (
		<StyleMenu
			label="Line height"
			testId="tiptap-line-height"
			trigger={<Rows3 />}
			value={value}
			options={LINE_HEIGHTS}
			onChange={(height) =>
				height === DEFAULT
					? editor.chain().focus().unsetLineHeight().run()
					: editor.chain().focus().setLineHeight(height).run()
			}
		/>
	);
}
