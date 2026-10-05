import type { Editor } from "@tiptap/react";
import { isTextSelection } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { RemoveFormatting } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ColorMenu, LinkPopover, MarkButtons, ToolbarButton } from "./controls";

/** Floating selection toolbar (official BubbleMenu, our own shadcn buttons). */
export function SelectionBubble({ editor }: { editor: Editor }) {
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
			<ToolbarButton
				label="Clear formatting"
				onRun={() => editor.chain().focus().unsetAllMarks().run()}
			>
				<RemoveFormatting />
			</ToolbarButton>
		</BubbleMenu>
	);
}
