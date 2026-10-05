import type { TableOfContentDataItem } from "@tiptap/extension-table-of-contents";
import type { Editor } from "@tiptap/react";
import { toast } from "sonner";
import { fileToDataUrl, MAX_IMAGE_BYTES } from "@/lib/image";

export type PromptKind =
	| "youtube"
	| "twitch"
	| "audio"
	| "inlineMath"
	| "blockMath"
	| "rubyText"
	| "imageAlt"
	| "imageCaption"
	| "html"
	| "markdown";

/**
 * Callbacks from extensions (slash menu, math click, TOC, shortcuts) back into React.
 * The Editor component owns one mutable instance and fills in the fields.
 */
export type EditorActions = {
	pickImage: () => void;
	pickAudio: () => void;
	prompt: (kind: PromptKind, initial?: string, pos?: number) => void;
	onToc: (items: TableOfContentDataItem[]) => void;
	openLink: () => void;
	openFind: () => void;
};

export function createEditorActions(): EditorActions {
	const noop = () => {};
	return {
		pickImage: noop,
		pickAudio: noop,
		prompt: noop,
		onToc: noop,
		openLink: noop,
		openFind: noop,
	};
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

/** Audio files follow the same rule as images: inlined, 1 MB at most. */
export async function insertAudioFile(editor: Editor, file: File) {
	if (!file.type.startsWith("audio/")) {
		toast.error(`${file.name} is not an audio file`);
		return;
	}
	if (file.size > MAX_IMAGE_BYTES) {
		toast.error(
			`Audio is ${(file.size / 1024 / 1024).toFixed(1)} MB; the limit is 1 MB because documents live in localStorage.`,
		);
		return;
	}
	const src = await fileToDataUrl(file);
	editor.chain().focus().setAudio({ src, controls: true }).run();
}
