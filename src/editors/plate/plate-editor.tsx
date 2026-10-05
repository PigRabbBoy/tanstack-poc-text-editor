import { MarkdownPlugin } from "@platejs/markdown";
import type { Value } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";
import { useCallback, useEffect, useRef } from "react";
import { Editor, EditorContainer } from "@/editors/plate/ui/editor";
import { TooltipProvider } from "@/editors/plate/ui/tooltip";
import type { EditorProps } from "@/editors/types";
import { EditorKit } from "./editor-kit";
import { PlateShowcase } from "./showcase";
import { toSnapshot } from "./snapshot";

const SNAPSHOT_DELAY_MS = 120;

function isValue(json: unknown): json is Value {
	return Array.isArray(json) && json.length > 0;
}

export default function PlateEditor({
	initialMarkdown,
	storedJson,
	onChange,
}: EditorProps) {
	const editor = usePlateEditor({
		plugins: EditorKit,
		value: (editor) =>
			isValue(storedJson)
				? storedJson
				: editor.getApi(MarkdownPlugin).markdown.deserialize(initialMarkdown),
	});

	// Markdown + HTML serialization runs on a static editor; coalesce bursts of
	// keystrokes and drop results that finish out of order.
	const sequence = useRef(0);
	const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const emit = useCallback(
		(value: Value, delay = SNAPSHOT_DELAY_MS) => {
			clearTimeout(timer.current);
			timer.current = setTimeout(async () => {
				const id = ++sequence.current;
				const snapshot = await toSnapshot(value);
				if (id === sequence.current) onChange(snapshot);
			}, delay);
		},
		[onChange],
	);

	useEffect(() => {
		emit(editor.children, 0);
		return () => clearTimeout(timer.current);
	}, [editor, emit]);

	return (
		<TooltipProvider>
			<div className="flex flex-col gap-3" data-testid="plate-editor">
				<Plate editor={editor} onValueChange={({ value }) => emit(value)}>
					<EditorContainer className="h-[calc(100vh-14rem)] min-h-[60vh] rounded-xl border bg-card shadow-card">
						<Editor
							variant="none"
							className="min-h-full px-14 pt-6 pb-40 text-base leading-[1.8]"
							placeholder="Type / for commands, @ to mention, {{ for a variable…"
						/>
					</EditorContainer>
				</Plate>
				<PlateShowcase editor={editor} />
			</div>
		</TooltipProvider>
	);
}
