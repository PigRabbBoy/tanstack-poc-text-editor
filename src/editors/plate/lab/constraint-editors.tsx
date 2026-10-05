import {
	KEYS,
	LengthPlugin,
	NormalizeTypesPlugin,
	SingleBlockPlugin,
	SingleLinePlugin,
	type Value,
} from "platejs";
import { Plate, useEditorSelector, usePlateEditor } from "platejs/react";
import { BasicBlocksKit } from "@/editors/plate/components/editor/plugins/basic-blocks-kit";
import { BasicMarksKit } from "@/editors/plate/components/editor/plugins/basic-marks-kit";
import { Editor, EditorContainer } from "@/editors/plate/ui/editor";

const TITLE_MAX = 60;

const paragraph = (text: string) => ({
	type: KEYS.p,
	children: [{ text }],
});

function CharacterCount() {
	const length = useEditorSelector(
		(editor) => editor.api.string([]).length,
		[],
	);
	return (
		<span
			className="font-label text-xs text-muted-foreground"
			data-testid="plate-lab-title-count"
		>
			{length}/{TITLE_MAX}
		</span>
	);
}

/** SingleLinePlugin + LengthPlugin: a one-line, length-capped field. */
export function SingleLineLab() {
	const editor = usePlateEditor({
		plugins: [
			...BasicMarksKit,
			SingleLinePlugin,
			LengthPlugin.configure({ options: { maxLength: TITLE_MAX } }),
		],
		value: [paragraph("ใบเสนอราคา — Plate POC")],
	});
	return (
		<Plate editor={editor}>
			<div className="flex items-center gap-2">
				<EditorContainer
					variant="select"
					className="flex-1"
					data-testid="plate-lab-single-line"
				>
					<Editor variant="select" placeholder="Document title" />
				</EditorContainer>
				<CharacterCount />
			</div>
		</Plate>
	);
}

/** SingleBlockPlugin: one root block; Enter becomes a soft break. */
export function SingleBlockLab() {
	const editor = usePlateEditor({
		plugins: [...BasicMarksKit, SingleBlockPlugin],
		value: [paragraph("Short note: Enter adds a line break, not a new block.")],
	});
	return (
		<Plate editor={editor}>
			<EditorContainer variant="select" data-testid="plate-lab-single-block">
				<Editor variant="select" placeholder="Short note" />
			</EditorContainer>
		</Plate>
	);
}

const forcedValue: Value = [
	{ type: KEYS.h1, children: [{ text: "Title stays a Heading 1" }] },
	paragraph(
		"Toggle the title off with ⌘⌥1 (Ctrl+Alt+1) or delete it: it comes back as H1.",
	),
];

/** NormalizeTypesPlugin ("Forced layout"): block 0 is always H1, block 1 a paragraph. */
export function ForcedLayoutLab() {
	const editor = usePlateEditor({
		plugins: [
			...BasicBlocksKit,
			...BasicMarksKit,
			NormalizeTypesPlugin.configure({
				options: {
					rules: [
						{ path: [0], strictType: KEYS.h1 },
						{ path: [1], type: KEYS.p },
					],
				},
			}),
		],
		value: forcedValue,
	});
	return (
		<Plate editor={editor}>
			<EditorContainer
				variant="select"
				data-testid="plate-lab-forced-layout"
				className="[&_h1]:text-xl"
			>
				<Editor variant="select" />
			</EditorContainer>
		</Plate>
	);
}
