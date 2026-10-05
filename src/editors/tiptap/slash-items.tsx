import type { Editor, Range } from "@tiptap/react";
import {
	AtSign,
	Braces,
	ChevronRightSquare,
	Code2,
	Heading1,
	Heading2,
	Heading3,
	ImageIcon,
	List,
	ListChecks,
	ListOrdered,
	Minus,
	Pilcrow,
	Quote,
	Sigma,
	Smile,
	SquareFunction,
	Table,
	Youtube,
} from "lucide-react";
import type { EditorActions } from "./editor-actions";
import type { MenuItem } from "./suggestion-menu";

export type SlashItem = MenuItem & {
	run: (editor: Editor, range: Range, actions: EditorActions) => void;
};

const BASIC = "Basic blocks";
const DATA = "Template data";
const MEDIA = "Media & embeds";
const ADVANCED = "Advanced";

export const SLASH_ITEMS: SlashItem[] = [
	{
		id: "paragraph",
		title: "Text",
		description: "Plain paragraph",
		group: BASIC,
		icon: <Pilcrow />,
		keywords: ["p", "paragraph"],
		run: (editor, range) =>
			editor.chain().focus().deleteRange(range).setParagraph().run(),
	},
	...([1, 2, 3] as const).map(
		(level): SlashItem => ({
			id: `heading${level}`,
			title: `Heading ${level}`,
			description: `${"#".repeat(level)} section title`,
			group: BASIC,
			icon: [<Heading1 key={1} />, <Heading2 key={2} />, <Heading3 key={3} />][
				level - 1
			],
			hint: "#".repeat(level),
			keywords: ["h", "title"],
			run: (editor, range) =>
				editor.chain().focus().deleteRange(range).setHeading({ level }).run(),
		}),
	),
	{
		id: "bulletList",
		title: "Bullet list",
		group: BASIC,
		icon: <List />,
		hint: "-",
		keywords: ["ul", "unordered"],
		run: (editor, range) =>
			editor.chain().focus().deleteRange(range).toggleBulletList().run(),
	},
	{
		id: "orderedList",
		title: "Numbered list",
		group: BASIC,
		icon: <ListOrdered />,
		hint: "1.",
		keywords: ["ol", "ordered"],
		run: (editor, range) =>
			editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
	},
	{
		id: "taskList",
		title: "Task list",
		group: BASIC,
		icon: <ListChecks />,
		hint: "[ ]",
		keywords: ["todo", "checkbox"],
		run: (editor, range) =>
			editor.chain().focus().deleteRange(range).toggleTaskList().run(),
	},
	{
		id: "blockquote",
		title: "Quote",
		group: BASIC,
		icon: <Quote />,
		hint: ">",
		run: (editor, range) =>
			editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
	},
	{
		id: "codeBlock",
		title: "Code block",
		description: "Syntax highlighted (lowlight)",
		group: BASIC,
		icon: <Code2 />,
		hint: "```",
		run: (editor, range) =>
			editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
	},
	{
		id: "horizontalRule",
		title: "Divider",
		group: BASIC,
		icon: <Minus />,
		hint: "---",
		keywords: ["hr", "rule"],
		run: (editor, range) =>
			editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
	},
	{
		id: "variable",
		title: "Variable",
		description: "Insert a {{variable}} chip",
		group: DATA,
		icon: <Braces />,
		hint: "{{",
		keywords: ["template", "placeholder", "field"],
		// Re-type the trigger so the variable picker opens in place.
		run: (editor, range) =>
			editor.chain().focus().insertContentAt(range, "{{").run(),
	},
	{
		id: "mention",
		title: "Mention",
		description: "Tag a person",
		group: DATA,
		icon: <AtSign />,
		hint: "@",
		keywords: ["person", "user"],
		run: (editor, range) =>
			editor.chain().focus().insertContentAt(range, "@").run(),
	},
	{
		id: "table",
		title: "Table",
		description: "3 × 3 with header row",
		group: BASIC,
		icon: <Table />,
		run: (editor, range) =>
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
				.run(),
	},
	{
		id: "image",
		title: "Image",
		description: "Upload (base64, ≤ 1 MB)",
		group: MEDIA,
		icon: <ImageIcon />,
		keywords: ["picture", "photo", "upload"],
		run: (editor, range, actions) => {
			editor.chain().focus().deleteRange(range).run();
			actions.pickImage();
		},
	},
	{
		id: "youtube",
		title: "YouTube",
		description: "Embed a video by URL",
		group: MEDIA,
		icon: <Youtube />,
		keywords: ["video", "embed"],
		run: (editor, range, actions) => {
			editor.chain().focus().deleteRange(range).run();
			actions.prompt("youtube");
		},
	},
	{
		id: "emoji",
		title: "Emoji",
		description: "Type : to search",
		group: MEDIA,
		icon: <Smile />,
		hint: ":",
		run: (editor, range) =>
			editor.chain().focus().insertContentAt(range, ":").run(),
	},
	{
		id: "details",
		title: "Toggle",
		description: "Collapsible details / summary",
		group: ADVANCED,
		icon: <ChevronRightSquare />,
		keywords: ["collapse", "accordion", "details"],
		run: (editor, range) =>
			editor.chain().focus().deleteRange(range).setDetails().run(),
	},
	{
		id: "inlineMath",
		title: "Inline math",
		description: "KaTeX formula in text",
		group: ADVANCED,
		icon: <Sigma />,
		hint: "$",
		keywords: ["latex", "katex", "equation"],
		run: (editor, range, actions) => {
			editor.chain().focus().deleteRange(range).run();
			actions.prompt("inlineMath");
		},
	},
	{
		id: "blockMath",
		title: "Block math",
		description: "Display equation",
		group: ADVANCED,
		icon: <SquareFunction />,
		hint: "$$",
		keywords: ["latex", "katex", "equation"],
		run: (editor, range, actions) => {
			editor.chain().focus().deleteRange(range).run();
			actions.prompt("blockMath");
		},
	},
];
