import type { TableOfContentDataItem } from "@tiptap/extension-table-of-contents";
import type { Editor } from "@tiptap/react";
import { toast } from "sonner";
import { fileToDataUrl } from "@/lib/image";

export type PromptKind = "youtube" | "inlineMath" | "blockMath";

/**
 * Callbacks from extensions (slash menu, math click, TOC) back into React.
 * The Editor component owns one mutable instance and fills in the fields.
 */
export type EditorActions = {
	pickImage: () => void;
	prompt: (kind: PromptKind, initial?: string, pos?: number) => void;
	onToc: (items: TableOfContentDataItem[]) => void;
};

export function createEditorActions(): EditorActions {
	return { pickImage: () => {}, prompt: () => {}, onToc: () => {} };
}

/** Images are inlined as data URLs (≤1 MB) — there is no upload server in this POC. */
export async function insertImageFiles(
	editor: Editor,
	files: File[],
	pos?: number,
): Promise<void> {
	for (const file of files) {
		if (!file.type.startsWith("image/")) {
			toast.error(`${file.name} is not an image`);
			continue;
		}
		try {
			const src = await fileToDataUrl(file);
			const image = { type: "image", attrs: { src, alt: file.name } };
			if (pos === undefined) editor.chain().focus().insertContent(image).run();
			else editor.chain().insertContentAt(pos, image).focus().run();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Could not read the image",
			);
		}
	}
}
