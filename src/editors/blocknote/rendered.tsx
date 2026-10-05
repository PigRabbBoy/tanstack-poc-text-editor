import "@blocknote/shadcn/style.css";
import "./blocknote.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { useEffect } from "react";
import type { RenderedProps } from "@/editors/types";
import {
	type AppEditor,
	type AppPartialBlock,
	baseEditorOptions,
} from "./schema";

function toBlocks(json: unknown): AppPartialBlock[] | undefined {
	return Array.isArray(json) && json.length > 0
		? (json as AppPartialBlock[])
		: undefined;
}

/** Read-only BlockNoteView fed straight from `editor.document` JSON (no HTML in between). */
export default function BlockNoteRendered({ json }: RenderedProps) {
	const editor = useCreateBlockNote({
		...baseEditorOptions,
		initialContent: toBlocks(json),
	}) as AppEditor;

	useEffect(() => {
		const blocks = toBlocks(json);
		if (blocks) editor.replaceBlocks(editor.document, blocks);
	}, [editor, json]);

	return (
		<BlockNoteView
			editor={editor}
			editable={false}
			theme="light"
			sideMenu={false}
			formattingToolbar={false}
			slashMenu={false}
			tableHandles={false}
			className="bml-blocknote bml-blocknote-readonly font-sans"
			data-testid="blocknote-rendered"
		/>
	);
}
