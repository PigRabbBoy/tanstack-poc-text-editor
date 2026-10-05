import { type Editor, useEditorState } from "@tiptap/react";
import {
	AlignCenter,
	AlignJustify,
	AlignLeft,
	AlignRight,
	ChevronDown,
	Code2,
	ImagePlus,
	List,
	ListChecks,
	ListIndentDecrease,
	ListIndentIncrease,
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
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	ColorMenu,
	keepEditorFocus,
	LinkPopover,
	MarkButtons,
	RubyButton,
	ToolbarButton,
} from "./controls";
import type { EditorActions } from "./editor-actions";
import { lowlight } from "./extensions";
import { FindReplace } from "./find-replace";
import { SettingsMenu, type ViewSettings } from "./settings-menu";
import { SLASH_ITEMS } from "./slash-items";
import {
	FontFamilyMenu,
	FontSizeMenu,
	LineHeightMenu,
} from "./text-style-controls";

function Divider() {
	return <Separator orientation="vertical" className="mx-1 h-6!" />;
}

const BLOCK_TYPES = [
	{ id: "paragraph", label: "Text" },
	{ id: "heading1", label: "Heading 1" },
	{ id: "heading2", label: "Heading 2" },
	{ id: "heading3", label: "Heading 3" },
	{ id: "heading4", label: "Heading 4" },
	{ id: "heading5", label: "Heading 5" },
	{ id: "heading6", label: "Heading 6" },
	{ id: "blockquote", label: "Quote" },
	{ id: "codeBlock", label: "Code block" },
] as const;

const LEVELS = [1, 2, 3, 4, 5, 6] as const;
type Level = (typeof LEVELS)[number];

function currentBlock(editor: Editor): string {
	for (const level of LEVELS)
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
				.setHeading({ level: Number(id.replace("heading", "")) as Level })
				.run();
	}
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="w-28 justify-between font-label"
					data-testid="tiptap-block-type"
					onMouseDown={(event) => event.preventDefault()}
				>
					{label}
					<ChevronDown className="opacity-60" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent onCloseAutoFocus={keepEditorFocus} align="start">
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

/** CodeBlockLowlight `language` attribute; shown only inside a code block. */
function CodeLanguageMenu({ editor }: { editor: Editor }) {
	const language = useEditorState({
		editor,
		selector: ({ editor: e }) =>
			e.isActive("codeBlock")
				? String(e.getAttributes("codeBlock").language ?? "auto")
				: null,
	});
	if (language === null) return null;
	return (
		<DropdownMenu>
			<Tooltip>
				<TooltipTrigger asChild>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="font-mono text-xs"
							data-testid="tiptap-code-language"
							onMouseDown={(event) => event.preventDefault()}
						>
							<Code2 /> {language}
						</Button>
					</DropdownMenuTrigger>
				</TooltipTrigger>
				<TooltipContent side="bottom">Code language (lowlight)</TooltipContent>
			</Tooltip>
			<DropdownMenuContent
				onCloseAutoFocus={keepEditorFocus}
				align="start"
				className="max-h-[60vh] overflow-y-auto"
			>
				<DropdownMenuRadioGroup
					value={language}
					onValueChange={(value) =>
						editor
							.chain()
							.focus()
							.updateAttributes("codeBlock", {
								language: value === "auto" ? null : value,
							})
							.run()
					}
				>
					<DropdownMenuRadioItem value="auto">
						auto-detect
					</DropdownMenuRadioItem>
					{lowlight.listLanguages().map((name) => (
						<DropdownMenuRadioItem key={name} value={name}>
							{name}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
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
			<DropdownMenuContent onCloseAutoFocus={keepEditorFocus} align="start">
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
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onSelect={() => editor.chain().focus().unsetTextAlign().run()}
				>
					Reset alignment
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

const NUMBERING = [
	{ value: "1", label: "1, 2, 3" },
	{ value: "a", label: "a, b, c" },
	{ value: "A", label: "A, B, C" },
	{ value: "i", label: "i, ii, iii" },
	{ value: "I", label: "I, II, III" },
];

/** ListKit: bullet / ordered / task lists, nesting (sink/lift) and ordered-list numbering. */
function ListButtons({ editor }: { editor: Editor }) {
	const state = useEditorState({
		editor,
		selector: ({ editor: e }) => {
			const item = e.isActive("taskItem") ? "taskItem" : "listItem";
			return {
				bulletList: e.isActive("bulletList"),
				orderedList: e.isActive("orderedList"),
				taskList: e.isActive("taskList"),
				numbering: String(e.getAttributes("orderedList").type ?? "1"),
				canSink: e.can().sinkListItem(item),
				canLift: e.can().liftListItem(item),
				item,
			};
		},
	});
	return (
		<>
			<ToolbarButton
				label="Bullet list"
				shortcut="⌘⇧8"
				active={state.bulletList}
				onRun={() => editor.chain().focus().toggleBulletList().run()}
			>
				<List />
			</ToolbarButton>
			<DropdownMenu>
				<ToolbarButton
					label="Numbered list"
					shortcut="⌘⇧7"
					active={state.orderedList}
					onRun={() => editor.chain().focus().toggleOrderedList().run()}
				>
					<ListOrdered />
				</ToolbarButton>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon-xs"
						aria-label="Numbering style"
						data-testid="tiptap-numbering"
						disabled={!state.orderedList}
						onMouseDown={(event) => event.preventDefault()}
					>
						<ChevronDown />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent onCloseAutoFocus={keepEditorFocus} align="start">
					<DropdownMenuLabel className="eyebrow">Numbering</DropdownMenuLabel>
					<DropdownMenuRadioGroup
						value={state.numbering}
						onValueChange={(value) =>
							editor
								.chain()
								.focus()
								.updateAttributes("orderedList", {
									type: value === "1" ? null : value,
								})
								.run()
						}
					>
						{NUMBERING.map((item) => (
							<DropdownMenuRadioItem key={item.value} value={item.value}>
								{item.label}
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>
			<ToolbarButton
				label="Task list"
				shortcut="⌘⇧9"
				active={state.taskList}
				onRun={() => editor.chain().focus().toggleTaskList().run()}
			>
				<ListChecks />
			</ToolbarButton>
			<ToolbarButton
				label="Indent list item"
				shortcut="Tab"
				disabled={!state.canSink}
				onRun={() => editor.chain().focus().sinkListItem(state.item).run()}
			>
				<ListIndentIncrease />
			</ToolbarButton>
			<ToolbarButton
				label="Outdent list item"
				shortcut="⇧Tab"
				disabled={!state.canLift}
				onRun={() => editor.chain().focus().liftListItem(state.item).run()}
			>
				<ListIndentDecrease />
			</ToolbarButton>
		</>
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
		["Toggle header row", run((c) => c.toggleHeaderRow().run())],
		["Toggle header column", run((c) => c.toggleHeaderColumn().run())],
		["Toggle header cell", run((c) => c.toggleHeaderCell().run())],
		["Merge cells", run((c) => c.mergeCells().run())],
		["Split cell", run((c) => c.splitCell().run())],
		["Merge / split (toggle)", run((c) => c.mergeOrSplit().run())],
		["Next cell (Tab)", run((c) => c.goToNextCell().run())],
		["Previous cell (⇧Tab)", run((c) => c.goToPreviousCell().run())],
		["Fix table structure", run((c) => c.fixTables().run())],
		["Delete row", run((c) => c.deleteRow().run()), true],
		["Delete column", run((c) => c.deleteColumn().run()), true],
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
							data-testid="tiptap-table-menu"
							className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
							onMouseDown={(event) => event.preventDefault()}
						>
							<Table />
						</Button>
					</DropdownMenuTrigger>
				</TooltipTrigger>
				<TooltipContent side="bottom">Table (TableKit)</TooltipContent>
			</Tooltip>
			<DropdownMenuContent
				onCloseAutoFocus={keepEditorFocus}
				align="start"
				className="max-h-[70vh] w-56 overflow-y-auto"
			>
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
	"hardBreak",
	"horizontalRule",
	"codeBlock",
	"details",
	"inlineMath",
	"blockMath",
	"mathMigrate",
	"youtube",
	"twitch",
	"audio",
	"audioFile",
	"html",
	"markdown",
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
					data-testid="tiptap-insert"
					onMouseDown={(event) => event.preventDefault()}
				>
					<Plus /> Insert
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				onCloseAutoFocus={keepEditorFocus}
				align="end"
				className="max-h-[70vh] w-64 overflow-y-auto"
			>
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

export type ToolbarProps = {
	editor: Editor;
	actions: EditorActions;
	linkOpen: boolean;
	onLinkOpenChange: (open: boolean) => void;
	findOpen: boolean;
	onFindOpenChange: (open: boolean) => void;
	view: ViewSettings;
	onViewChange: (next: ViewSettings) => void;
};

export function FixedToolbar({
	editor,
	actions,
	linkOpen,
	onLinkOpenChange,
	findOpen,
	onFindOpenChange,
	view,
	onViewChange,
}: ToolbarProps) {
	const state = useEditorState({
		editor,
		selector: ({ editor: e }) => ({
			editable: e.isEditable,
			canUndo: e.can().undo(),
			canRedo: e.can().redo(),
		}),
	});
	return (
		<div
			role="toolbar"
			aria-label="Formatting"
			data-testid="tiptap-toolbar"
			data-readonly={!state.editable}
			className="sticky top-16 z-20 flex flex-wrap items-center gap-0.5 border-b bg-background/95 px-2 py-1.5 backdrop-blur"
		>
			{/* Read-only mode disables every formatting control except find and settings. */}
			<div
				className="tiptap-format-controls contents"
				aria-disabled={!state.editable}
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
				<CodeLanguageMenu editor={editor} />
				<FontFamilyMenu editor={editor} />
				<FontSizeMenu editor={editor} />
				<Divider />
				<MarkButtons editor={editor} />
				<RubyButton
					editor={editor}
					onPrompt={(initial) => actions.prompt("rubyText", initial)}
				/>
				<ColorMenu editor={editor} />
				<LinkPopover
					editor={editor}
					open={linkOpen}
					onOpenChange={onLinkOpenChange}
				/>
				<Divider />
				<ListButtons editor={editor} />
				<AlignMenu editor={editor} />
				<LineHeightMenu editor={editor} />
				<Divider />
				<ToolbarButton label="Image (≤ 1 MB)" onRun={() => actions.pickImage()}>
					<ImagePlus />
				</ToolbarButton>
				<TableMenu editor={editor} />
				<InsertMenu editor={editor} actions={actions} />
			</div>
			<div className="ml-auto flex items-center gap-0.5">
				<FindReplace
					editor={editor}
					open={findOpen}
					onOpenChange={onFindOpenChange}
				/>
				<SettingsMenu editor={editor} view={view} onViewChange={onViewChange} />
			</div>
		</div>
	);
}
