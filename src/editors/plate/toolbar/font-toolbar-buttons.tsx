import {
	FontFamilyPlugin,
	FontWeightPlugin,
} from "@platejs/basic-styles/react";
import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";
import { DropdownMenuItemIndicator } from "@radix-ui/react-dropdown-menu";
import { BoldIcon, CheckIcon, TypeIcon } from "lucide-react";
import { KEYS } from "platejs";
import { useEditorRef, useEditorSelector } from "platejs/react";
import { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/editors/plate/ui/dropdown-menu";
import { ToolbarButton } from "@/editors/plate/ui/toolbar";

const DEFAULT = "default";

/**
 * Boonmee Lab fonts first (loaded by the app), then common system fonts.
 * Names are unquoted CSS family names: React would escape quotes inside the
 * style attribute, which breaks the DOCX export's CSS inliner (see docx-io.ts).
 */
export const FONT_FAMILIES = [
	{ group: "Boonmee Lab", label: "Work Sans", value: "Work Sans, sans-serif" },
	{ group: "Boonmee Lab", label: "Poppins", value: "Poppins, sans-serif" },
	{
		group: "Boonmee Lab",
		label: "Montserrat",
		value: "Montserrat, sans-serif",
	},
	{ group: "Boonmee Lab", label: "Anuphan", value: "Anuphan, sans-serif" },
	{ group: "System", label: "Arial", value: "Arial, sans-serif" },
	{ group: "System", label: "Tahoma", value: "Tahoma, sans-serif" },
	{ group: "System", label: "Georgia", value: "Georgia, serif" },
	{
		group: "System",
		label: "Times New Roman",
		value: "Times New Roman, serif",
	},
	{ group: "System", label: "Courier New", value: "Courier New, monospace" },
] as const;

const FONT_WEIGHTS = [
	{ label: "Light", value: "300" },
	{ label: "Regular", value: "400" },
	{ label: "Medium", value: "500" },
	{ label: "Semibold", value: "600" },
	{ label: "Bold", value: "700" },
	{ label: "Extra bold", value: "800" },
] as const;

function useMark(key: string) {
	return useEditorSelector(
		(editor) => {
			const mark = editor.api.marks()?.[key];
			return typeof mark === "string" ? mark : DEFAULT;
		},
		[key],
	);
}

function RadioItem({ value, label }: { value: string; label: string }) {
	return (
		<DropdownMenuRadioItem
			className="min-w-[180px] pl-2 *:first:[span]:hidden"
			value={value}
		>
			<span className="pointer-events-none absolute right-2 flex size-3.5 items-center justify-center">
				<DropdownMenuItemIndicator>
					<CheckIcon />
				</DropdownMenuItemIndicator>
			</span>
			{label}
		</DropdownMenuRadioItem>
	);
}

/** FontFamilyPlugin has no registry button; this one lists the BML fonts first. */
export function FontFamilyToolbarButton(props: DropdownMenuProps) {
	const editor = useEditorRef();
	const [open, setOpen] = useState(false);
	const value = useMark(KEYS.fontFamily);
	const current = FONT_FAMILIES.find((font) => font.value === value);

	return (
		<DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
			<DropdownMenuTrigger asChild>
				<ToolbarButton
					pressed={open}
					tooltip="Font family"
					isDropdown
					className="min-w-[7.5rem] justify-between"
				>
					<TypeIcon />
					<span className="truncate text-xs">
						{current?.label ?? "Default font"}
					</span>
				</ToolbarButton>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" data-testid="plate-font-family-menu">
				<DropdownMenuRadioGroup
					value={value}
					onValueChange={(next) => {
						if (next === DEFAULT) editor.tf.removeMarks(KEYS.fontFamily);
						else
							editor.getTransforms(FontFamilyPlugin).fontFamily.addMark(next);
						editor.tf.focus();
					}}
				>
					<RadioItem value={DEFAULT} label="Default font" />
					{(["Boonmee Lab", "System"] as const).map((group) => (
						<div key={group}>
							<DropdownMenuSeparator />
							<DropdownMenuLabel className="text-xs text-muted-foreground">
								{group}
							</DropdownMenuLabel>
							{FONT_FAMILIES.filter((font) => font.group === group).map(
								(font) => (
									<RadioItem
										key={font.value}
										value={font.value}
										label={font.label}
									/>
								),
							)}
						</div>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/** FontWeightPlugin (documented, no registry button). */
export function FontWeightToolbarButton(props: DropdownMenuProps) {
	const editor = useEditorRef();
	const [open, setOpen] = useState(false);
	const value = useMark(KEYS.fontWeight);

	return (
		<DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
			<DropdownMenuTrigger asChild>
				<ToolbarButton pressed={open} tooltip="Font weight" isDropdown>
					<BoldIcon />
				</ToolbarButton>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				<DropdownMenuRadioGroup
					value={value}
					onValueChange={(next) => {
						if (next === DEFAULT) editor.tf.removeMarks(KEYS.fontWeight);
						else
							editor.getTransforms(FontWeightPlugin).fontWeight.addMark(next);
						editor.tf.focus();
					}}
				>
					<RadioItem value={DEFAULT} label="Default weight" />
					{FONT_WEIGHTS.map((weight) => (
						<RadioItem
							key={weight.value}
							value={weight.value}
							label={`${weight.label} (${weight.value})`}
						/>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
