import {
	ArrowDown,
	ArrowUp,
	Blocks,
	Copy,
	Download,
	Eye,
	FileInput,
	History,
	IndentDecrease,
	IndentIncrease,
	Languages,
	MessageSquare,
	Pencil,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EXPORT_FORMATS, type ExportFormat, runExport } from "./exporters";
import { LANGUAGES, type UiLanguage } from "./i18n";
import { htmlToBlocks } from "./markdown";
import type { AppEditor, AppPartialBlock } from "./schema";

export type Panel = "comments" | "history" | null;

type ImportMode = "replace-html" | "paste-html" | "paste-markdown";

const IMPORT_MODES: Record<
	ImportMode,
	{ label: string; description: string; api: string }
> = {
	"replace-html": {
		label: "Replace with HTML…",
		description:
			"Parses the HTML with tryParseHTMLToBlocks and replaces the document. data-type variable/mention spans become chips.",
		api: "editor.tryParseHTMLToBlocks",
	},
	"paste-html": {
		label: "Paste HTML at cursor…",
		description: "Inserts the HTML at the cursor as if it had been pasted.",
		api: "editor.pasteHTML",
	},
	"paste-markdown": {
		label: "Paste markdown at cursor…",
		description: "Inserts the markdown at the cursor as if it had been pasted.",
		api: "editor.pasteMarkdown",
	},
};

function ImportDialog({
	editor,
	mode,
	onClose,
}: {
	editor: AppEditor;
	mode: ImportMode | null;
	onClose: () => void;
}) {
	const [text, setText] = useState("");
	const info = mode ? IMPORT_MODES[mode] : null;

	function apply() {
		if (!mode) return;
		if (mode === "replace-html")
			editor.replaceBlocks(editor.document, htmlToBlocks(editor, text));
		else if (mode === "paste-html") editor.pasteHTML(text);
		else editor.pasteMarkdown(text);
		onClose();
	}

	return (
		<Dialog open={mode !== null} onOpenChange={(open) => !open && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{info?.label.replace("…", "")}</DialogTitle>
					<DialogDescription>
						{info?.description} <code>{info?.api}</code>
					</DialogDescription>
				</DialogHeader>
				<textarea
					className="min-h-48 w-full rounded-lg border bg-background p-3 font-mono text-sm"
					value={text}
					onChange={(event) => setText(event.target.value)}
					aria-label="Content to import"
					data-testid="blocknote-import-text"
				/>
				<DialogFooter>
					<Button onClick={apply} data-testid="blocknote-import-apply">
						Import
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

/** Block manipulation API (docs: "Manipulating Content"), applied to the block at the cursor. */
function BlockMenu({ editor }: { editor: AppEditor }) {
	const current = () => editor.getTextCursorPosition().block;
	const actions = [
		{
			label: "Move up",
			icon: ArrowUp,
			shortcut: "⇧⌘↑",
			run: () => editor.moveBlocksUp(),
		},
		{
			label: "Move down",
			icon: ArrowDown,
			shortcut: "⇧⌘↓",
			run: () => editor.moveBlocksDown(),
		},
		{
			label: "Nest",
			icon: IndentIncrease,
			shortcut: "Tab",
			run: () => editor.canNestBlock() && editor.nestBlock(),
		},
		{
			label: "Unnest",
			icon: IndentDecrease,
			shortcut: "⇧Tab",
			run: () => editor.canUnnestBlock() && editor.unnestBlock(),
		},
		{
			label: "Duplicate",
			icon: Copy,
			run: () => {
				// A copy without id or children (they would clash with the original's).
				const { id: _id, children: _children, ...copy } = current();
				// One transaction, so one undo step.
				editor.transact(() =>
					editor.insertBlocks([copy as AppPartialBlock], current(), "after"),
				);
			},
		},
		{
			label: "Delete",
			icon: Trash2,
			run: () => editor.removeBlocks([current()]),
		},
	];
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" data-testid="blocknote-block-menu">
					<Blocks /> Block
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				<DropdownMenuLabel>Block at the cursor</DropdownMenuLabel>
				{actions.map(({ label, icon: Icon, shortcut, run }) => (
					<DropdownMenuItem
						key={label}
						onSelect={() => {
							run();
							editor.focus();
						}}
					>
						<Icon /> {label}
						{shortcut && (
							<DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>
						)}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function ExportMenu({ editor }: { editor: AppEditor }) {
	const [busy, setBusy] = useState(false);

	async function run(format: ExportFormat, label: string) {
		setBusy(true);
		const pending = toast.loading(`Exporting ${label}…`);
		try {
			// Each exporter lazy-loads its packages inside runExport.
			const status = await runExport(format, editor);
			toast.success(status ? `${label}: ${status}` : `Exported ${label}`, {
				id: pending,
			});
		} catch (error) {
			console.warn(error);
			toast.error(
				error instanceof Error ? error.message : `Could not export ${label}`,
				{ id: pending },
			);
		} finally {
			setBusy(false);
		}
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					disabled={busy}
					data-testid="blocknote-export-menu"
				>
					<Download /> Export
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				<DropdownMenuLabel>BlockNote exporters</DropdownMenuLabel>
				{EXPORT_FORMATS.map((format) => (
					<DropdownMenuItem
						key={format.id}
						data-testid={`blocknote-export-${format.id}`}
						onSelect={() => void run(format.id, format.label)}
					>
						{format.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/** Page-level BlockNote tools that are not part of BlockNote's own toolbars. */
export function ToolsBar({
	editor,
	language,
	onLanguage,
	readOnly,
	onReadOnly,
	panel,
	onPanel,
}: {
	editor: AppEditor;
	language: UiLanguage;
	onLanguage: (language: UiLanguage) => void;
	readOnly: boolean;
	onReadOnly: (readOnly: boolean) => void;
	panel: Panel;
	onPanel: (panel: Panel) => void;
}) {
	const [importMode, setImportMode] = useState<ImportMode | null>(null);
	const languageLabel =
		LANGUAGES.find((item) => item.id === language)?.label ?? language;

	return (
		<div
			className="flex flex-wrap items-center gap-2 border-b px-3 py-2"
			data-testid="blocknote-tools"
		>
			<ExportMenu editor={editor} />
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="outline"
						size="sm"
						data-testid="blocknote-import-menu"
					>
						<FileInput /> Import
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start">
					{(Object.keys(IMPORT_MODES) as ImportMode[]).map((mode) => (
						<DropdownMenuItem
							key={mode}
							data-testid={`blocknote-import-${mode}`}
							onSelect={() => setImportMode(mode)}
						>
							{IMPORT_MODES[mode].label}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
			<BlockMenu editor={editor} />
			<Button
				variant={panel === "comments" ? "secondary" : "outline"}
				size="sm"
				aria-pressed={panel === "comments"}
				onClick={() => onPanel(panel === "comments" ? null : "comments")}
				data-testid="blocknote-comments-panel"
			>
				<MessageSquare /> Comments
			</Button>
			<Button
				variant={panel === "history" ? "secondary" : "outline"}
				size="sm"
				aria-pressed={panel === "history"}
				onClick={() => onPanel(panel === "history" ? null : "history")}
				data-testid="blocknote-history-panel"
			>
				<History /> History
			</Button>
			<Button
				variant={readOnly ? "secondary" : "outline"}
				size="sm"
				aria-pressed={readOnly}
				onClick={() => onReadOnly(!readOnly)}
				data-testid="blocknote-readonly"
			>
				{readOnly ? <Eye /> : <Pencil />} {readOnly ? "Read-only" : "Editing"}
			</Button>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className="ml-auto font-label"
						data-testid="blocknote-language"
						title="BlockNote UI dictionary"
					>
						<Languages /> UI: {languageLabel}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
					<DropdownMenuLabel>UI dictionary</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuRadioGroup
						value={language}
						onValueChange={(value) => onLanguage(value as UiLanguage)}
					>
						{LANGUAGES.map((item) => (
							<DropdownMenuRadioItem
								key={item.id}
								value={item.id}
								data-testid={`blocknote-language-${item.id}`}
							>
								{item.label}
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>
			<ImportDialog
				editor={editor}
				mode={importMode}
				onClose={() => setImportMode(null)}
			/>
		</div>
	);
}
