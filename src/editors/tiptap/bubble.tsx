import type { Editor } from "@tiptap/react";
import { isTextSelection, useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Captions, RemoveFormatting, TextQuote, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	ColorMenu,
	LinkPopover,
	MarkButtons,
	RubyButton,
	ToolbarButton,
} from "./controls";
import type { EditorActions } from "./editor-actions";

/** Floating selection toolbar (official BubbleMenu, our own shadcn buttons). */
export function SelectionBubble({
	editor,
	actions,
}: {
	editor: Editor;
	actions: EditorActions;
}) {
	return (
		<BubbleMenu
			editor={editor}
			options={{ placement: "top", offset: 8 }}
			shouldShow={({ editor: e, state, from, to }) => {
				if (!e.isEditable || from === to) return false;
				if (!isTextSelection(state.selection)) return false;
				if (e.isActive("codeBlock")) return false;
				return state.doc.textBetween(from, to).trim().length > 0;
			}}
			className="z-30 flex items-center gap-0.5 rounded-md border bg-popover p-1 shadow-elevated"
			data-testid="tiptap-bubble-menu"
		>
			<MarkButtons
				editor={editor}
				marks={["bold", "italic", "underline", "strike", "code"]}
			/>
			<Separator orientation="vertical" className="mx-1 h-6!" />
			<ColorMenu editor={editor} />
			<LinkPopover editor={editor} />
			<RubyButton
				editor={editor}
				onPrompt={(initial) => actions.prompt("rubyText", initial)}
			/>
			<ToolbarButton
				label="Clear formatting"
				onRun={() => editor.chain().focus().unsetAllMarks().run()}
			>
				<RemoveFormatting />
			</ToolbarButton>
		</BubbleMenu>
	);
}

const SIZES = [
	{ label: "S", width: 240 },
	{ label: "M", width: 420 },
	{ label: "L", width: 640 },
	{ label: "Auto", width: null },
] as const;

/** Second BubbleMenu (own pluginKey) for a selected image: alt, caption, size presets, delete. */
export function ImageBubble({
	editor,
	actions,
}: {
	editor: Editor;
	actions: EditorActions;
}) {
	const image = useEditorState({
		editor,
		selector: ({ editor: e }) => {
			if (!e.isActive("image")) return null;
			const attrs = e.getAttributes("image");
			return {
				pos: e.state.selection.from,
				alt: String(attrs.alt ?? ""),
				title: String(attrs.title ?? ""),
				width: (attrs.width as number | null) ?? null,
			};
		},
	});
	return (
		<BubbleMenu
			editor={editor}
			pluginKey="imageBubble"
			options={{ placement: "top", offset: 8 }}
			shouldShow={({ editor: e }) => e.isEditable && e.isActive("image")}
			className="z-30 flex items-center gap-0.5 rounded-md border bg-popover p-1 shadow-elevated"
			data-testid="tiptap-image-bubble"
		>
			<Button
				variant="ghost"
				size="sm"
				onMouseDown={(event) => event.preventDefault()}
				onClick={() =>
					image && actions.prompt("imageAlt", image.alt, image.pos)
				}
			>
				<TextQuote /> Alt
			</Button>
			<Button
				variant="ghost"
				size="sm"
				data-testid="tiptap-image-caption"
				onMouseDown={(event) => event.preventDefault()}
				onClick={() =>
					image && actions.prompt("imageCaption", image.title, image.pos)
				}
			>
				<Captions /> Caption
			</Button>
			<Separator orientation="vertical" className="mx-1 h-6!" />
			{SIZES.map((size) => (
				<ToolbarButton
					key={size.label}
					label={
						size.width
							? `Width ${size.width}px`
							: "Natural size (drag the corners to resize)"
					}
					active={image?.width === size.width}
					className="px-2 font-label text-xs"
					onRun={() =>
						editor
							.chain()
							.focus()
							.updateAttributes("image", { width: size.width, height: null })
							.run()
					}
				>
					{size.label}
				</ToolbarButton>
			))}
			<Separator orientation="vertical" className="mx-1 h-6!" />
			<ToolbarButton
				label="Delete image"
				onRun={() => editor.chain().focus().deleteSelection().run()}
			>
				<Trash2 />
			</ToolbarButton>
		</BubbleMenu>
	);
}
