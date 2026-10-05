import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { $getRoot, $getSelection } from "lexical";
import { Image } from "lucide-react";
import { useCallback, useRef } from "react";
import { toast } from "sonner";

import { fileToDataUrl } from "@/lib/image";

import { INSERT_IMAGE_COMMAND } from "@/editors/lexical/components/editor/nodes/image-node";
import { useTranslation } from "@/editors/lexical/components/editor/plugins/i18n-plugin";
import { Button } from "@/editors/lexical/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/editors/lexical/ui/tooltip";

// POC: images are stored inline as base64 data URLs with a 1 MB cap.
function readFileAsDataUrl(file: File): Promise<string> {
	return fileToDataUrl(file).catch((error: unknown) => {
		toast.error(error instanceof Error ? error.message : "Could not read image");
		throw error;
	});
}

export function useImageFilePicker() {
	const [editor] = useLexicalComposerContext();
	const inputRef = useRef<HTMLInputElement>(null);

	const pick = useCallback(() => {
		inputRef.current?.click();
	}, []);

	const onChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			event.target.value = "";
			if (!file) {
				return;
			}
			readFileAsDataUrl(file).then((src) => {
				editor.update(() => {
					if (!$getSelection()) {
						$getRoot().selectEnd();
					}
				});
				editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
					altText: file.name,
					src,
				});
			}, () => {});
		},
		[editor],
	);

	const input = (
		<input
			ref={inputRef}
			type="file"
			accept="image/*"
			className="hidden"
			onChange={onChange}
		/>
	);

	return { pick, input };
}

export function InsertImagePlugin() {
	const isEditable = useLexicalEditable();
	const { t } = useTranslation();
	const { pick, input } = useImageFilePicker();

	return (
		<>
			<Tooltip>
				<TooltipTrigger
					render={
						<Button
							variant="outline"
							size="icon-sm"
							aria-label={t.insertImage}
							disabled={!isEditable}
							onClick={pick}
						>
							<Image />
						</Button>
					}
				/>
				<TooltipContent>{t.insertImage}</TooltipContent>
			</Tooltip>
			{input}
		</>
	);
}
