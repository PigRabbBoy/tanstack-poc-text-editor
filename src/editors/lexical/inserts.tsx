import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import {
	$getRoot,
	$getSelection,
	type LexicalCommand,
	type LexicalEditor,
} from "lexical";
import {
	FileImage,
	ImagePlus,
	MessageSquarePlus,
	PenTool,
	Scissors,
	StickyNote,
} from "lucide-react";
import { type ReactNode, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";
import { INSERT_INLINE_COMMAND } from "@/editors/lexical/components/editor/extensions/comment";
import { INSERT_IMAGE_COMMAND } from "@/editors/lexical/components/editor/nodes/image-node";
import {
	type ComponentPickerItem,
	useComponentPickerItems,
} from "@/editors/lexical/components/editor/plugins/component-picker/component-picker-plugin";
import { INSERT_EXCALIDRAW_COMMAND } from "@/editors/lexical/components/playground/excalidraw";
import { OPEN_INLINE_IMAGE_DIALOG_COMMAND } from "@/editors/lexical/components/playground/inline-image";
import { INSERT_PAGE_BREAK } from "@/editors/lexical/components/playground/page-break";
import { INSERT_STICKY_COMMAND } from "@/editors/lexical/components/playground/sticky";
import { Button } from "@/editors/lexical/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/editors/lexical/ui/tooltip";
import { fileToDataUrl } from "@/lib/image";

function ensureSelection(editor: LexicalEditor) {
	editor.update(() => {
		if (!$getSelection()) $getRoot().selectEnd();
	});
}

function dispatch(editor: LexicalEditor, command: LexicalCommand<void>) {
	ensureSelection(editor);
	editor.dispatchCommand(command, undefined);
}

function ToolButton({
	label,
	onClick,
	children,
	testId,
}: {
	label: string;
	onClick: () => void;
	children: ReactNode;
	testId?: string;
}) {
	const isEditable = useLexicalEditable();
	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button
						variant="outline"
						size="icon-sm"
						aria-label={label}
						data-testid={testId}
						disabled={!isEditable}
						onClick={onClick}
					>
						{children}
					</Button>
				}
			/>
			<TooltipContent>{label}</TooltipContent>
		</Tooltip>
	);
}

/** Opens a GIF file picker; the GIF is inlined as base64 (≤1 MB) through ImageNode. */
function useGifPicker(editor: LexicalEditor) {
	const inputRef = useRef<HTMLInputElement>(null);
	const pick = useCallback(() => inputRef.current?.click(), []);
	const input = (
		<input
			ref={inputRef}
			type="file"
			accept="image/gif"
			className="hidden"
			data-testid="gif-file-input"
			onChange={(event) => {
				const file = event.target.files?.[0];
				event.target.value = "";
				if (!file) return;
				fileToDataUrl(file).then(
					(src) => {
						ensureSelection(editor);
						editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
							altText: file.name,
							src,
						});
					},
					(error: unknown) =>
						toast.error(
							error instanceof Error ? error.message : "Could not read GIF",
						),
				);
			}}
		/>
	);
	return { input, pick };
}

/** Toolbar buttons for the playground blocks this POC ported. */
export function PlaygroundInsertButtons() {
	const [editor] = useLexicalComposerContext();
	const gif = useGifPicker(editor);
	return (
		<>
			<ToolButton
				label="Insert page break"
				testId="insert-page-break"
				onClick={() => dispatch(editor, INSERT_PAGE_BREAK)}
			>
				<Scissors />
			</ToolButton>
			<ToolButton
				label="Insert inline image"
				testId="insert-inline-image"
				onClick={() => dispatch(editor, OPEN_INLINE_IMAGE_DIALOG_COMMAND)}
			>
				<ImagePlus />
			</ToolButton>
			<ToolButton label="Insert GIF" testId="insert-gif" onClick={gif.pick}>
				<FileImage />
			</ToolButton>
			{gif.input}
			<ToolButton
				label="Insert Excalidraw drawing"
				testId="insert-excalidraw"
				onClick={() => dispatch(editor, INSERT_EXCALIDRAW_COMMAND)}
			>
				<PenTool />
			</ToolButton>
			<ToolButton
				label="Add sticky note"
				testId="insert-sticky"
				onClick={() => dispatch(editor, INSERT_STICKY_COMMAND)}
			>
				<StickyNote />
			</ToolButton>
			<ToolButton
				label="Comment on selection"
				testId="insert-comment"
				onClick={() => editor.dispatchCommand(INSERT_INLINE_COMMAND, undefined)}
			>
				<MessageSquarePlus />
			</ToolButton>
		</>
	);
}

/** Slash-menu entries for the same blocks. */
export function PlaygroundPickerPlugin() {
	const [editor] = useLexicalComposerContext();
	const gif = useGifPicker(editor);
	const pickGif = gif.pick;

	const items = useMemo<ComponentPickerItem[]>(
		() => [
			{
				value: "page-break",
				label: "Page Break",
				icon: <Scissors className="text-muted-foreground" />,
				keywords: ["page break", "divider", "print"],
				onSelect: () => dispatch(editor, INSERT_PAGE_BREAK),
			},
			{
				value: "inline-image",
				label: "Inline Image",
				icon: <ImagePlus className="text-muted-foreground" />,
				keywords: ["image", "inline", "float", "photo"],
				onSelect: () => dispatch(editor, OPEN_INLINE_IMAGE_DIALOG_COMMAND),
			},
			{
				value: "gif",
				label: "GIF",
				icon: <FileImage className="text-muted-foreground" />,
				keywords: ["gif", "animation", "image"],
				onSelect: pickGif,
			},
			{
				value: "excalidraw",
				label: "Excalidraw",
				icon: <PenTool className="text-muted-foreground" />,
				keywords: ["excalidraw", "diagram", "drawing", "sketch"],
				onSelect: () => dispatch(editor, INSERT_EXCALIDRAW_COMMAND),
			},
			{
				value: "sticky",
				label: "Sticky Note",
				icon: <StickyNote className="text-muted-foreground" />,
				keywords: ["sticky", "note", "post-it"],
				onSelect: () => dispatch(editor, INSERT_STICKY_COMMAND),
			},
		],
		[editor, pickGif],
	);

	useComponentPickerItems(items);

	return gif.input;
}
