import { KEYS, type Value } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";
import { useState } from "react";
import { USERS } from "@/data/users";
import { ClassicListEditorKit } from "@/editors/plate/editor-kit";
import { Editor, EditorContainer } from "@/editors/plate/ui/editor";
import {
	SelectEditor,
	SelectEditorCombobox,
	SelectEditorContent,
	SelectEditorInput,
	type SelectItem,
} from "@/editors/plate/ui/select-editor";

const LABELS: SelectItem[] = [
	{ value: "Quotation" },
	{ value: "Draft" },
	{ value: "Needs legal review" },
	{ value: "Thai" },
	{ value: "English" },
	...USERS.map((user) => ({ value: `@${user.name}` })),
];

/** @platejs/tag MultiSelectPlugin + the registry SelectEditor (fzf search, create new). */
export function TagsLab() {
	const [value, setValue] = useState<SelectItem[]>([{ value: "Quotation" }]);
	return (
		<div className="space-y-1" data-testid="plate-lab-tags">
			<SelectEditor value={value} onValueChange={setValue} items={LABELS}>
				<SelectEditorContent>
					<SelectEditorInput placeholder="Add labels…" />
					<SelectEditorCombobox />
				</SelectEditorContent>
			</SelectEditor>
			<p
				className="font-label text-xs text-muted-foreground"
				data-testid="plate-lab-tags-value"
			>
				{value.map((item) => item.value).join(", ") || "No labels"}
			</p>
		</div>
	);
}

const item = (text: string, children: Value = []) => ({
	type: KEYS.li,
	children: [{ type: KEYS.lic, children: [{ text }] }, ...children],
});

const CLASSIC_VALUE: Value = [
	{
		type: KEYS.p,
		children: [{ text: "Classic lists nest real ul/ol/li elements:" }],
	},
	{
		type: KEYS.ulClassic,
		children: [
			item("Discovery workshop"),
			item("Implementation", [
				{
					type: KEYS.olClassic,
					children: [item("Editor integration"), item("Template variables")],
				},
			]),
		],
	},
	{
		type: KEYS.taskList,
		children: [
			{ ...item("Send draft"), checked: true },
			{ ...item("Legal review"), checked: false },
		],
	},
	{
		type: KEYS.p,
		children: [
			{
				text: "Tab / Shift+Tab nest and lift items; “- ” or “1. ” starts a list.",
			},
		],
	},
];

/** @platejs/list-classic with the registry's classic toolbars (no slash menu). */
export function ClassicListLab() {
	const editor = usePlateEditor({
		plugins: ClassicListEditorKit,
		value: CLASSIC_VALUE,
	});
	return (
		<Plate editor={editor}>
			<EditorContainer
				className="max-h-[420px] rounded-lg border"
				data-testid="plate-lab-classic-list"
			>
				<Editor
					variant="none"
					className="px-10 pt-4 pb-10 text-base leading-[1.8]"
				/>
			</EditorContainer>
		</Plate>
	);
}
