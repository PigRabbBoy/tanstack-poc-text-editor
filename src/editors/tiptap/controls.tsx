import { type Editor, useEditorState } from "@tiptap/react";
import {
	Bold,
	Code,
	ExternalLink,
	Highlighter,
	Italic,
	Languages,
	Link2,
	Link2Off,
	Palette,
	Strikethrough,
	Subscript,
	Superscript,
	Underline,
} from "lucide-react";
import {
	type ComponentProps,
	type ReactNode,
	useEffect,
	useState,
} from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Toggle } from "@/components/ui/toggle";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * `onCloseAutoFocus` for every toolbar menu: Radix would move focus back to the
 * trigger after the item's command already focused the editor, so the next
 * keystroke would land on the button instead of the text.
 */
export function keepEditorFocus(event: Event) {
	event.preventDefault();
}

type ToolbarButtonProps = Omit<
	ComponentProps<typeof Toggle>,
	"pressed" | "onPressedChange"
> & {
	label: string;
	shortcut?: string;
	active?: boolean;
	onRun: () => void;
};

/** shadcn Toggle + Tooltip; keeps editor focus by preventing mousedown default. */
export function ToolbarButton({
	label,
	shortcut,
	active = false,
	onRun,
	className,
	children,
	...props
}: ToolbarButtonProps) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Toggle
					size="sm"
					aria-label={label}
					pressed={active}
					onPressedChange={() => onRun()}
					onMouseDown={(event) => event.preventDefault()}
					className={cn("h-8 min-w-8", className)}
					{...props}
				>
					{children}
				</Toggle>
			</TooltipTrigger>
			<TooltipContent side="bottom">
				{label}
				{shortcut && <span className="ml-2 opacity-70">{shortcut}</span>}
			</TooltipContent>
		</Tooltip>
	);
}

const MARKS = [
	{ name: "bold", label: "Bold", shortcut: "⌘B", icon: <Bold /> },
	{ name: "italic", label: "Italic", shortcut: "⌘I", icon: <Italic /> },
	{
		name: "underline",
		label: "Underline",
		shortcut: "⌘U",
		icon: <Underline />,
	},
	{
		name: "strike",
		label: "Strikethrough",
		shortcut: "⌘⇧S",
		icon: <Strikethrough />,
	},
	{ name: "code", label: "Inline code", shortcut: "⌘E", icon: <Code /> },
	{
		name: "subscript",
		label: "Subscript",
		shortcut: "⌘,",
		icon: <Subscript />,
	},
	{
		name: "superscript",
		label: "Superscript",
		shortcut: "⌘.",
		icon: <Superscript />,
	},
] as const;

type MarkName = (typeof MARKS)[number]["name"];

export function MarkButtons({
	editor,
	marks = MARKS.map((mark) => mark.name),
}: {
	editor: Editor;
	marks?: MarkName[];
}) {
	const active = useEditorState({
		editor,
		selector: ({ editor: e }) =>
			Object.fromEntries(
				MARKS.map((mark) => [mark.name, e.isActive(mark.name)]),
			),
	});
	return (
		<>
			{MARKS.filter((mark) => marks.includes(mark.name)).map((mark) => (
				<ToolbarButton
					key={mark.name}
					label={mark.label}
					shortcut={mark.shortcut}
					active={active[mark.name]}
					data-testid={`tiptap-mark-${mark.name}`}
					onRun={() => editor.chain().focus().toggleMark(mark.name).run()}
				>
					{mark.icon}
				</ToolbarButton>
			))}
		</>
	);
}

/** Popover to add / edit / remove a link on the current selection (⌘K opens the toolbar one). */
export function LinkPopover({
	editor,
	open: controlledOpen,
	onOpenChange,
}: {
	editor: Editor;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}) {
	const [localOpen, setLocalOpen] = useState(false);
	const open = controlledOpen ?? localOpen;
	const setOpen = onOpenChange ?? setLocalOpen;
	const [href, setHref] = useState("");
	// Re-read the link when the popover is opened from outside (⌘K).
	useEffect(() => {
		if (open) setHref(String(editor.getAttributes("link").href ?? ""));
	}, [open, editor]);
	const active = useEditorState({
		editor,
		selector: ({ editor: e }) => e.isActive("link"),
	});

	function apply() {
		const url = href.trim();
		const chain = editor.chain().focus().extendMarkRange("link");
		if (url) chain.setLink({ href: url }).run();
		else chain.unsetLink().run();
		setOpen(false);
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<Tooltip>
				<TooltipTrigger asChild>
					<PopoverTrigger asChild>
						<Toggle
							size="sm"
							aria-label="Link"
							pressed={active}
							className="h-8 min-w-8"
							onMouseDown={(event) => event.preventDefault()}
						>
							<Link2 />
						</Toggle>
					</PopoverTrigger>
				</TooltipTrigger>
				<TooltipContent side="bottom">Link ⌘K</TooltipContent>
			</Tooltip>
			<PopoverContent className="w-80 p-3" align="start">
				<form
					className="flex gap-2"
					onSubmit={(event) => {
						event.preventDefault();
						apply();
					}}
				>
					<Input
						autoFocus
						placeholder="https://boonmeelab.com"
						value={href}
						onChange={(event) => setHref(event.target.value)}
						aria-label="Link URL"
					/>
					<Button type="submit" size="sm">
						Apply
					</Button>
					{active && href && (
						<Button
							type="button"
							size="icon-sm"
							variant="ghost"
							aria-label="Open link in a new tab"
							onClick={() => window.open(href, "_blank", "noopener")}
						>
							<ExternalLink />
						</Button>
					)}
					{active && (
						<Button
							type="button"
							size="icon-sm"
							variant="ghost"
							aria-label="Remove link"
							onClick={() => {
								editor
									.chain()
									.focus()
									.extendMarkRange("link")
									.unsetLink()
									.run();
								setOpen(false);
							}}
						>
							<Link2Off />
						</Button>
					)}
				</form>
			</PopoverContent>
		</Popover>
	);
}

// Content colours are document data (stored in the JSON / HTML), so they are literal values.
const TEXT_COLORS = [
	{ label: "Default", value: null },
	{ label: "Magenta", value: "#c71e63" },
	{ label: "Navy", value: "#2c378d" },
	{ label: "Green", value: "#00a078" },
	{ label: "Orange", value: "#f5854a" },
	{ label: "Muted", value: "#777777" },
];

const BACKGROUNDS = [
	{ label: "None", value: null },
	{ label: "Pink", value: "#feebf2" },
	{ label: "Lavender", value: "#eceffb" },
	{ label: "Lime", value: "#f1f7c9" },
	{ label: "Sky", value: "#dff3fb" },
];

function Swatch({
	color,
	children,
}: {
	color: string | null;
	children?: ReactNode;
}) {
	return (
		<span
			className="flex size-5 items-center justify-center rounded-sm border text-xs font-semibold"
			style={{ background: color ?? "transparent" }}
		>
			{children}
		</span>
	);
}

/** Native colour input for "unlimited colours" (Color / BackgroundColor accept any CSS colour). */
function CustomColor({
	label,
	onPick,
}: {
	label: string;
	onPick: (color: string) => void;
}) {
	return (
		<label className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent">
			<input
				type="color"
				className="size-5 cursor-pointer rounded-sm border-0 bg-transparent p-0"
				aria-label={label}
				onChange={(event) => onPick(event.target.value)}
			/>
			{label}
		</label>
	);
}

/** Text colour (Color), text background (BackgroundColor) and multicolour Highlight mark. */
export function ColorMenu({ editor }: { editor: Editor }) {
	return (
		<DropdownMenu>
			<Tooltip>
				<TooltipTrigger asChild>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon-sm"
							aria-label="Text colour and highlight"
							onMouseDown={(event) => event.preventDefault()}
						>
							<Palette />
						</Button>
					</DropdownMenuTrigger>
				</TooltipTrigger>
				<TooltipContent side="bottom">
					Colour, background & highlight
				</TooltipContent>
			</Tooltip>
			<DropdownMenuContent
				onCloseAutoFocus={keepEditorFocus}
				align="start"
				className="max-h-[70vh] w-56 overflow-y-auto"
			>
				<DropdownMenuLabel className="eyebrow">Text colour</DropdownMenuLabel>
				{TEXT_COLORS.map((color) => (
					<DropdownMenuItem
						key={color.label}
						onSelect={() =>
							color.value
								? editor.chain().focus().setColor(color.value).run()
								: editor.chain().focus().unsetColor().run()
						}
					>
						<Swatch color={null}>
							<span style={{ color: color.value ?? undefined }}>A</span>
						</Swatch>
						{color.label}
					</DropdownMenuItem>
				))}
				<CustomColor
					label="Custom text colour…"
					onPick={(color) => editor.chain().focus().setColor(color).run()}
				/>
				<DropdownMenuSeparator />
				<DropdownMenuLabel className="eyebrow">
					Background (text style)
				</DropdownMenuLabel>
				{BACKGROUNDS.map((color) => (
					<DropdownMenuItem
						key={color.label}
						data-testid={`tiptap-bg-${color.label.toLowerCase()}`}
						onSelect={() =>
							color.value
								? editor.chain().focus().setBackgroundColor(color.value).run()
								: editor.chain().focus().unsetBackgroundColor().run()
						}
					>
						<Swatch color={color.value} />
						{color.label}
					</DropdownMenuItem>
				))}
				<CustomColor
					label="Custom background…"
					onPick={(color) =>
						editor.chain().focus().setBackgroundColor(color).run()
					}
				/>
				<DropdownMenuSeparator />
				<DropdownMenuLabel className="eyebrow">
					Highlight (mark)
				</DropdownMenuLabel>
				{BACKGROUNDS.map((color) => (
					<DropdownMenuItem
						key={color.label}
						onSelect={() =>
							color.value
								? editor
										.chain()
										.focus()
										.setHighlight({ color: color.value })
										.run()
								: editor.chain().focus().unsetHighlight().run()
						}
					>
						<Swatch color={color.value}>
							{color.value ? null : <Highlighter className="size-3" />}
						</Swatch>
						{color.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/** RubyText: asks for the annotation, then wraps the selection in <ruby>. */
export function RubyButton({
	editor,
	onPrompt,
}: {
	editor: Editor;
	onPrompt: (initial: string) => void;
}) {
	const active = useEditorState({
		editor,
		selector: ({ editor: e }) => e.isActive("rubyText"),
	});
	return (
		<ToolbarButton
			label="Ruby annotation (furigana)"
			active={active}
			data-testid="tiptap-ruby"
			onRun={() => onPrompt(String(editor.getAttributes("rubyText").rt ?? ""))}
		>
			<Languages />
		</ToolbarButton>
	);
}
