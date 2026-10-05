import { migrateMathStrings } from "@tiptap/extension-mathematics";
import type { Editor, Range } from "@tiptap/react";
import {
	AtSign,
	AudioLines,
	Braces,
	ChevronRightSquare,
	Code2,
	CornerDownLeft,
	FileCode,
	FileMusic,
	FileText,
	Heading1,
	Heading2,
	Heading3,
	Heading4,
	Heading5,
	Heading6,
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
	Twitch,
	WandSparkles,
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
	...([1, 2, 3, 4, 5, 6] as const).map(
		(level): SlashItem => ({
			id: `heading${level}`,
			title: `Heading ${level}`,
			description: `${"#".repeat(level)} section title`,
			group: BASIC,
			icon: [
				<Heading1 key={1} />,
				<Heading2 key={2} />,
				<Heading3 key={3} />,
				<Heading4 key={4} />,
				<Heading5 key={5} />,
				<Heading6 key={6} />,
			][level - 1],
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
		id: "hardBreak",
		title: "Line break",
		description: "Soft break inside the block (Shift+Enter)",
		group: BASIC,
		icon: <CornerDownLeft />,
		keywords: ["br", "newline", "shift"],
		run: (editor, range) =>
			editor.chain().focus().deleteRange(range).setHardBreak().run(),
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
		id: "twitch",
		title: "Twitch",
		description: "Embed a video, clip or channel",
		group: MEDIA,
		icon: <Twitch />,
		keywords: ["video", "stream", "embed"],
		run: (editor, range, actions) => {
			editor.chain().focus().deleteRange(range).run();
			actions.prompt("twitch");
		},
	},
	{
		id: "audio",
		title: "Audio (URL)",
		description: "<audio> player from an mp3/ogg/wav link",
		group: MEDIA,
		icon: <AudioLines />,
		keywords: ["sound", "podcast", "mp3"],
		run: (editor, range, actions) => {
			editor.chain().focus().deleteRange(range).run();
			actions.prompt("audio");
		},
	},
	{
		id: "audioFile",
		title: "Audio file",
		description: "Inline an audio file (base64, ≤ 1 MB)",
		group: MEDIA,
		icon: <FileMusic />,
		keywords: ["sound", "upload", "mp3"],
		run: (editor, range, actions) => {
			editor.chain().focus().deleteRange(range).run();
			actions.pickAudio();
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
	{
		id: "mathMigrate",
		title: "Convert $…$ text to math",
		description: "migrateMathStrings() over the whole document",
		group: ADVANCED,
		icon: <WandSparkles />,
		keywords: ["latex", "katex", "migrate"],
		run: (editor, range) => {
			editor.chain().focus().deleteRange(range).run();
			migrateMathStrings(editor);
		},
	},
	{
		id: "html",
		title: "Insert HTML",
		description: "Paste HTML → generateJSON() → insert",
		group: ADVANCED,
		icon: <FileCode />,
		keywords: ["paste", "import", "generateJSON"],
		run: (editor, range, actions) => {
			editor.chain().focus().deleteRange(range).run();
			actions.prompt("html");
		},
	},
	{
		id: "markdown",
		title: "Insert markdown",
		description: "Parse markdown at the caret",
		group: ADVANCED,
		icon: <FileText />,
		keywords: ["md", "paste", "import"],
		run: (editor, range, actions) => {
			editor.chain().focus().deleteRange(range).run();
			actions.prompt("markdown");
		},
	},
];
