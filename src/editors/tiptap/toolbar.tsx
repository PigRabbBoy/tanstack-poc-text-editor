import { type Editor, useEditorState } from "@tiptap/react";
import {
	AlignCenter,
	AlignJustify,
	AlignLeft,
	AlignRight,
	ChevronDown,
	ImagePlus,
	List,
	ListChecks,
	ListOrdered,
	Plus,
	Redo2,
	Table,
	Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { ColorMenu, LinkPopover, MarkButtons, ToolbarButton } from "./controls";
import type { EditorActions } from "./editor-actions";
import { SLASH_ITEMS } from "./slash-items";

function Divider() {
	return <Separator orientation="vertical" className="mx-1 h-6!" />;
}

const BLOCK_TYPES = [
	{ id: "paragraph", label: "Text" },
	{ id: "heading1", label: "Heading 1" },
	{ id: "heading2", label: "Heading 2" },
	{ id: "heading3", label: "Heading 3" },
	{ id: "blockquote", label: "Quote" },
	{ id: "codeBlock", label: "Code block" },
] as const;

function currentBlock(editor: Editor): string {
	for (const level of [1, 2, 3] as const)
		if (editor.isActive("heading", { level })) return `heading${level}`;
	if (editor.isActive("codeBlock")) return "codeBlock";
	if (editor.isActive("blockquote")) return "blockquote";
	return "paragraph";
}

function BlockTypeMenu({ editor }: { editor: Editor }) {
	const block = useEditorState({
		editor,
		selector: ({ editor: e }) => currentBlock(e),
	});
	const label = BLOCK_TYPES.find((type) => type.id === block)?.label ?? "Text";
	function apply(id: string) {
		const chain = editor.chain().focus();
		if (id === "paragraph") chain.setParagraph().run();
		else if (id === "blockquote") chain.toggleBlockquote().run();
		else if (id === "codeBlock") chain.toggleCodeBlock().run();
		else
			chain
				.setHeading({ level: Number(id.replace("heading", "")) as 1 | 2 | 3 })
				.run();
	}
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="w-32 justify-between font-label"
					data-testid="tiptap-block-type"
					onMouseDown={(event) => event.preventDefault()}
				>
					{label}
					<ChevronDown className="opacity-60" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				{BLOCK_TYPES.map((type) => (
					<DropdownMenuItem
						key={type.id}
						onSelect={() => apply(type.id)}
						className={type.id === block ? "bg-accent" : undefined}
					>
						{type.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

const ALIGNMENTS = [
	{ value: "left", label: "Align left", icon: <AlignLeft /> },
	{ value: "center", label: "Align center", icon: <AlignCenter /> },
	{ value: "right", label: "Align right", icon: <AlignRight /> },
	{ value: "justify", label: "Justify", icon: <AlignJustify /> },
] as const;

function AlignMenu({ editor }: { editor: Editor }) {
	const align = useEditorState({
		editor,
		selector: ({ editor: e }) =>
			ALIGNMENTS.find((item) => e.isActive({ textAlign: item.value }))?.value ??
			"left",
	});
	const current = ALIGNMENTS.find((item) => item.value === align);
	return (
		<DropdownMenu>
			<Tooltip>
				<TooltipTrigger asChild>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon-sm"
							aria-label="Text alignment"
							onMouseDown={(event) => event.preventDefault()}
						>
							{current?.icon}
						</Button>
					</DropdownMenuTrigger>
				</TooltipTrigger>
				<TooltipContent side="bottom">Alignment</TooltipContent>
			</Tooltip>
			<DropdownMenuContent align="start">
				{ALIGNMENTS.map((item) => (
					<DropdownMenuItem
						key={item.value}
						onSelect={() =>
							editor.chain().focus().setTextAlign(item.value).run()
						}
					>
						{item.icon}
						{item.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function TableMenu({ editor }: { editor: Editor }) {
	const inTable = useEditorState({
		editor,
		selector: ({ editor: e }) => e.isActive("table"),
	});
	const run = (fn: (chain: ReturnType<Editor["chain"]>) => unknown) => () => {
		fn(editor.chain().focus());
	};
	const actions: Array<[string, () => void, boolean?]> = [
		["Add row above", run((c) => c.addRowBefore().run())],
		["Add row below", run((c) => c.addRowAfter().run())],
		["Add column left", run((c) => c.addColumnBefore().run())],
		["Add column right", run((c) => c.addColumnAfter().run())],
		["Delete row", run((c) => c.deleteRow().run()), true],
		["Delete column", run((c) => c.deleteColumn().run()), true],
		["Toggle header row", run((c) => c.toggleHeaderRow().run())],
		["Merge / split cells", run((c) => c.mergeOrSplit().run())],
		["Delete table", run((c) => c.deleteTable().run()), true],
	];
	return (
		<DropdownMenu>
			<Tooltip>
				<TooltipTrigger asChild>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon-sm"
							aria-label="Table"
							data-active={inTable}
							className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
							onMouseDown={(event) => event.preventDefault()}
						>
							<Table />
						</Button>
					</DropdownMenuTrigger>
				</TooltipTrigger>
				<TooltipContent side="bottom">Table</TooltipContent>
			</Tooltip>
			<DropdownMenuContent align="start" className="w-52">
				<DropdownMenuItem
					onSelect={run((c) =>
						c.insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
					)}
				>
					Insert 3 × 3 table
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuLabel className="eyebrow">Current table</DropdownMenuLabel>
				{actions.map(([label, onSelect, destructive]) => (
					<DropdownMenuItem
						key={label}
						disabled={!inTable}
						variant={destructive ? "destructive" : "default"}
						onSelect={onSelect}
					>
						{label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

const INSERT_IDS = [
	"variable",
	"mention",
	"emoji",
	"horizontalRule",
	"codeBlock",
	"details",
	"inlineMath",
	"blockMath",
	"youtube",
];

function InsertMenu({
	editor,
	actions,
}: {
	editor: Editor;
	actions: EditorActions;
}) {
	const items = SLASH_ITEMS.filter((item) => INSERT_IDS.includes(item.id));
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="font-label"
					onMouseDown={(event) => event.preventDefault()}
				>
					<Plus /> Insert
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-60">
				{items.map((item) => (
					<DropdownMenuItem
						key={item.id}
						onSelect={() => {
							const { from } = editor.state.selection;
							// Slash items expect a range to replace; use an empty one at the caret.
							item.run(editor, { from, to: from }, actions);
						}}
					>
						{item.icon}
						<span className="flex flex-col">
							<span>{item.title}</span>
							{item.description && (
								<span className="text-xs text-muted-foreground">
									{item.description}
								</span>
							)}
						</span>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function FixedToolbar({
	editor,
	actions,
}: {
	editor: Editor;
	actions: EditorActions;
}) {
	const state = useEditorState({
		editor,
		selector: ({ editor: e }) => ({
			canUndo: e.can().undo(),
			canRedo: e.can().redo(),
			bulletList: e.isActive("bulletList"),
			orderedList: e.isActive("orderedList"),
			taskList: e.isActive("taskList"),
		}),
	});
	return (
		<div
			role="toolbar"
			aria-label="Formatting"
			data-testid="tiptap-toolbar"
			className="sticky top-16 z-20 flex flex-wrap items-center gap-0.5 border-b bg-background/95 px-2 py-1.5 backdrop-blur"
		>
			<ToolbarButton
				label="Undo"
				shortcut="⌘Z"
				disabled={!state.canUndo}
				onRun={() => editor.chain().focus().undo().run()}
			>
				<Undo2 />
			</ToolbarButton>
			<ToolbarButton
				label="Redo"
				shortcut="⌘⇧Z"
				disabled={!state.canRedo}
				onRun={() => editor.chain().focus().redo().run()}
			>
				<Redo2 />
			</ToolbarButton>
			<Divider />
			<BlockTypeMenu editor={editor} />
			<Divider />
			<MarkButtons editor={editor} />
			<ColorMenu editor={editor} />
			<LinkPopover editor={editor} />
			<Divider />
			<ToolbarButton
				label="Bullet list"
				active={state.bulletList}
				onRun={() => editor.chain().focus().toggleBulletList().run()}
			>
				<List />
			</ToolbarButton>
			<ToolbarButton
				label="Numbered list"
				active={state.orderedList}
				onRun={() => editor.chain().focus().toggleOrderedList().run()}
			>
				<ListOrdered />
			</ToolbarButton>
			<ToolbarButton
				label="Task list"
				active={state.taskList}
				onRun={() => editor.chain().focus().toggleTaskList().run()}
			>
				<ListChecks />
			</ToolbarButton>
			<AlignMenu editor={editor} />
			<Divider />
			<ToolbarButton label="Image (≤ 1 MB)" onRun={() => actions.pickImage()}>
				<ImagePlus />
			</ToolbarButton>
			<TableMenu editor={editor} />
			<InsertMenu editor={editor} actions={actions} />
		</div>
	);
}
