import { DRAG_DROP_PASTE } from "@lexical/rich-text";
import { isMimeType } from "@lexical/utils";
import { COMMAND_PRIORITY_LOW, defineExtension } from "lexical";
import { toast } from "sonner";

import { fileToDataUrl } from "@/lib/image";

import { ImageExtension } from "@/editors/lexical/components/editor/extensions/image";
import { INSERT_IMAGE_COMMAND } from "@/editors/lexical/components/editor/nodes/image-node";

const ACCEPTABLE_IMAGE_TYPES = [
	"image/",
	"image/heic",
	"image/heif",
	"image/gif",
	"image/webp",
];

export const DragDropPasteExtension = defineExtension({
	name: "@shadcn-editor/drag-drop-paste",
	dependencies: [ImageExtension],
	register: (editor) =>
		editor.registerCommand(
			DRAG_DROP_PASTE,
			(files) => {
				(async () => {
					// POC: route through fileToDataUrl so the 1 MB cap applies.
					for (const file of files) {
						if (!isMimeType(file, ACCEPTABLE_IMAGE_TYPES)) {
							continue;
						}
						try {
							const src = await fileToDataUrl(file);
							editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
								altText: file.name,
								src,
							});
						} catch (error) {
							toast.error(
								error instanceof Error ? error.message : "Could not read image",
							);
						}
					}
				})();
				return true;
			},
			COMMAND_PRIORITY_LOW,
		),
});
