import type { Editor } from "@tiptap/react";
import { FloatingMenu } from "@tiptap/react/menus";
import {
	Braces,
	Heading1,
	Heading2,
	ImagePlus,
	List,
	ListChecks,
	Plus,
	Quote,
	Table,
} from "lucide-react";
import type { ReactNode } from "react";
import { ToolbarButton } from "./controls";
import type { EditorActions } from "./editor-actions";

type QuickItem = {
	label: string;
	icon: ReactNode;
	run: (editor: Editor, actions: EditorActions) => void;
};

const QUICK: QuickItem[] = [
	{
		label: "All blocks (/)",
		icon: <Plus />,
		run: (editor) => editor.chain().focus().insertContent("/").run(),
	},
	{
		label: "Heading 1",
		icon: <Heading1 />,
		run: (editor) => editor.chain().focus().setHeading({ level: 1 }).run(),
	},
	{
		label: "Heading 2",
		icon: <Heading2 />,
		run: (editor) => editor.chain().focus().setHeading({ level: 2 }).run(),
	},
	{
		label: "Bullet list",
		icon: <List />,
		run: (editor) => editor.chain().focus().toggleBulletList().run(),
	},
	{
		label: "Task list",
		icon: <ListChecks />,
		run: (editor) => editor.chain().focus().toggleTaskList().run(),
	},
	{
		label: "Quote",
		icon: <Quote />,
		run: (editor) => editor.chain().focus().toggleBlockquote().run(),
	},
	{
		label: "Table",
		icon: <Table />,
		run: (editor) =>
			editor
				.chain()
				.focus()
				.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
				.run(),
	},
	{
		label: "Image (≤ 1 MB)",
		icon: <ImagePlus />,
		run: (_editor, actions) => actions.pickImage(),
	},
	{
		label: "Variable ({{)",
		icon: <Braces />,
		run: (editor) => editor.chain().focus().insertContent("{{").run(),
	},
];

/** Official FloatingMenu: quick-insert buttons on an empty line. */
export function EmptyLineMenu({
	editor,
	actions,
}: {
	editor: Editor;
	actions: EditorActions;
}) {
	return (
		<FloatingMenu
			editor={editor}
			options={{ placement: "bottom-start", offset: 6 }}
			className="z-20 flex items-center gap-0.5 rounded-md border bg-popover p-1 shadow-elevated"
			data-testid="tiptap-floating-menu"
		>
			{QUICK.map((item) => (
				<ToolbarButton
					key={item.label}
					label={item.label}
					onRun={() => item.run(editor, actions)}
				>
					{item.icon}
				</ToolbarButton>
			))}
		</FloatingMenu>
	);
}
