import { KEYS } from "platejs";
import {
	createPlatePlugin,
	Plate,
	PlateElement,
	type PlateElementProps,
	usePlateEditor,
} from "platejs/react";
import { useId, useState } from "react";
import { BasicNodesKit } from "@/editors/plate/components/editor/plugins/basic-nodes-kit";
import { Editor, EditorContainer } from "@/editors/plate/ui/editor";

const ROLES = ["Customer", "Boonmee Lab"] as const;

/** Docs example "Editable Voids": form controls + a nested Plate inside a void. */
function SignatureElement(props: PlateElementProps) {
	const [name, setName] = useState("");
	const [role, setRole] = useState<(typeof ROLES)[number]>("Customer");
	const id = useId();
	const inner = usePlateEditor({
		plugins: BasicNodesKit,
		value: [
			{
				type: KEYS.p,
				children: [{ text: "Nested editor: notes for the signer" }],
			},
		],
	});

	return (
		<PlateElement {...props}>
			<div
				contentEditable={false}
				className="my-2 space-y-2 rounded-lg border bg-muted/40 p-3 text-sm"
				data-testid="plate-lab-editable-void"
			>
				<label className="flex items-center gap-2">
					<span className="font-label text-xs">Signer</span>
					<input
						className="flex-1 rounded-sm border bg-background px-2 py-1"
						value={name}
						onChange={(event) => setName(event.target.value)}
						placeholder="Name"
						aria-label="Signer name"
					/>
				</label>
				<fieldset className="flex gap-3">
					{ROLES.map((value) => (
						<label key={value} className="flex items-center gap-1">
							<input
								type="radio"
								name={id}
								checked={role === value}
								onChange={() => setRole(value)}
							/>
							{value}
						</label>
					))}
				</fieldset>
				<Plate editor={inner}>
					<EditorContainer variant="select">
						<Editor variant="select" />
					</EditorContainer>
				</Plate>
				<p className="text-xs text-muted-foreground">
					{name
						? `${name} signs for ${role}.`
						: "Type a name — the outer editor keeps its selection."}
				</p>
			</div>
			{props.children}
		</PlateElement>
	);
}

const SignaturePlugin = createPlatePlugin({
	key: "signature",
	node: { component: SignatureElement, isElement: true, isVoid: true },
});

export function EditableVoidLab() {
	const editor = usePlateEditor({
		plugins: [...BasicNodesKit, SignaturePlugin],
		value: [
			{
				type: KEYS.p,
				children: [
					{ text: "An outer paragraph, then a void with its own inputs:" },
				],
			},
			{ type: SignaturePlugin.key, children: [{ text: "" }] },
			{ type: KEYS.p, children: [{ text: "" }] },
		],
	});
	return (
		<Plate editor={editor}>
			<EditorContainer variant="select">
				<Editor variant="select" />
			</EditorContainer>
		</Plate>
	);
}
