import "katex/dist/katex.min.css";
import "./tiptap.css";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import type { TableOfContentDataItem } from "@tiptap/extension-table-of-contents";
import {
	EditorContent,
	type JSONContent,
	type Editor as TiptapEditor,
	useEditor,
	useEditorState,
} from "@tiptap/react";
import { GripVertical, ListTree, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { Input } from "@/components/ui/input";
import type { EditorModule, EditorProps, Snapshot } from "@/editors/types";
import { cn } from "@/lib/utils";
import { SelectionBubble } from "./bubble";
import {
	createEditorActions,
	insertImageFiles,
	type PromptKind,
} from "./editor-actions";
import { editorExtensions } from "./editor-extensions";
import { meta } from "./meta";
import { TiptapRendered } from "./rendered";
import { FixedToolbar } from "./toolbar";

function snapshotOf(editor: TiptapEditor): Snapshot {
	return {
		json: editor.getJSON(),
		html: editor.getHTML(),
		markdown: editor.getMarkdown(),
	};
}

type PromptState = { kind: PromptKind; value: string; pos?: number };

const PROMPTS: Record<
	PromptKind,
	{ title: string; description: string; placeholder: string }
> = {
	youtube: {
		title: "Embed a YouTube video",
		description: "Paste a youtube.com or youtu.be link (rendered nocookie).",
		placeholder: "https://www.youtube.com/watch?v=…",
	},
	inlineMath: {
		title: "Inline math",
		description: "LaTeX rendered with KaTeX. Markdown: $…$",
		placeholder: "E = mc^2",
	},
	blockMath: {
		title: "Block math",
		description: "LaTeX rendered with KaTeX. Markdown: $$…$$",
		placeholder: "\\sum_{i=1}^{n} x_i",
	},
};

function PromptDialog({
	editor,
	prompt,
	onClose,
}: {
	editor: TiptapEditor;
	prompt: PromptState | null;
	onClose: () => void;
}) {
	const [value, setValue] = useState("");
	useEffect(() => setValue(prompt?.value ?? ""), [prompt]);
	const copy = prompt ? PROMPTS[prompt.kind] : PROMPTS.youtube;

	function submit() {
		if (!prompt) return;
		const text = value.trim();
		const chain = editor.chain().focus();
		if (prompt.kind === "youtube") {
			if (!chain.setYoutubeVideo({ src: text }).run())
				toast.error("That does not look like a YouTube URL");
		} else if (prompt.kind === "inlineMath") {
			if (prompt.pos !== undefined)
				chain.updateInlineMath({ latex: text, pos: prompt.pos }).run();
			else if (text) chain.insertInlineMath({ latex: text }).run();
		} else if (prompt.pos !== undefined) {
			chain.updateBlockMath({ latex: text, pos: prompt.pos }).run();
		} else if (text) {
			chain.insertBlockMath({ latex: text }).run();
		}
		onClose();
	}

	return (
		<Dialog open={prompt !== null} onOpenChange={(open) => !open && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{copy.title}</DialogTitle>
					<DialogDescription>{copy.description}</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						submit();
					}}
				>
					<Input
						autoFocus
						value={value}
						placeholder={copy.placeholder}
						onChange={(event) => setValue(event.target.value)}
						className="font-mono"
						aria-label={copy.title}
					/>
					<DialogFooter className="mt-4">
						<Button type="button" variant="ghost" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit">
							{prompt?.pos !== undefined ? "Update" : "Insert"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function StatusBar({ editor }: { editor: TiptapEditor }) {
	const counts = useEditorState({
		editor,
		selector: ({ editor: e }) => ({
			characters: e.storage.characterCount.characters(),
			words: e.storage.characterCount.words(),
		}),
	});
	return (
		<div
			className="flex flex-wrap items-center justify-between gap-2 border-t bg-muted/60 px-4 py-2 font-label text-xs text-muted-foreground"
			data-testid="tiptap-status"
		>
			<span>
				{counts.words.toLocaleString()} words ·{" "}
				{counts.characters.toLocaleString()} characters
			</span>
			<span>
				Type <kbd className="font-mono">/</kbd> blocks ·{" "}
				<kbd className="font-mono">@</kbd> people ·{" "}
				<kbd className="font-mono">{"{{"}</kbd> variables ·{" "}
				<kbd className="font-mono">:</kbd> emoji
			</span>
		</div>
	);
}

function Outline({ items }: { items: TableOfContentDataItem[] }) {
	if (items.length === 0) return null;
	return (
		<nav aria-label="Outline" className="space-y-1" data-testid="tiptap-toc">
			{items.map((item) => (
				<a
					key={item.id}
					href={`#${item.id}`}
					onClick={(event) => {
						event.preventDefault();
						item.dom.scrollIntoView({ behavior: "smooth", block: "center" });
					}}
					className={cn(
						"block truncate rounded-sm px-2 py-0.5 text-sm hover:bg-muted",
						item.isActive && "bg-accent text-accent-foreground",
					)}
					style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
				>
					{item.textContent || "Untitled"}
				</a>
			))}
		</nav>
	);
}

function Extras({ toc }: { toc: TableOfContentDataItem[] }) {
	return (
		<div className="grid gap-4 md:grid-cols-2">
			<section className="rounded-xl border p-4">
				<h2 className="eyebrow mb-2 flex items-center gap-2 text-primary-text">
					<ListTree className="size-4" /> Outline (TableOfContents)
				</h2>
				<Outline items={toc} />
			</section>
			<section className="rounded-xl border p-4" data-testid="tiptap-showcase">
				<h2 className="eyebrow mb-2 flex items-center gap-2 text-primary-text">
					<Sparkles className="size-4" /> Tiptap showcase
				</h2>
				<ul className="list-disc space-y-1 pl-5 text-sm">
					{meta.showcase.map((item) => (
						<li key={item}>{item}</li>
					))}
				</ul>
			</section>
		</div>
	);
}

function Editor({ initialMarkdown, storedJson, onChange }: EditorProps) {
	const onChangeRef = useRef(onChange);
	useEffect(() => {
		onChangeRef.current = onChange;
	});
	const fileInput = useRef<HTMLInputElement>(null);
	const [toc, setToc] = useState<TableOfContentDataItem[]>([]);
	const [prompt, setPrompt] = useState<PromptState | null>(null);

	// Extensions call back into React through this (stable) object.
	const actions = useMemo(createEditorActions, []);
	actions.pickImage = () => fileInput.current?.click();
	actions.prompt = (kind, initial, pos) =>
		setPrompt({ kind, value: initial ?? "", pos });
	actions.onToc = setToc;

	const options = useMemo(
		() => ({
			immediatelyRender: false,
			extensions: editorExtensions(actions),
			content:
				storedJson !== null ? (storedJson as JSONContent) : initialMarkdown,
			contentType:
				storedJson !== null ? ("json" as const) : ("markdown" as const),
			editorProps: {
				attributes: {
					class: "tiptap-prose",
					"data-testid": "tiptap-content",
					spellcheck: "false",
				},
			},
			onCreate: ({ editor }: { editor: TiptapEditor }) =>
				onChangeRef.current(snapshotOf(editor)),
			onUpdate: ({ editor }: { editor: TiptapEditor }) =>
				onChangeRef.current(snapshotOf(editor)),
		}),
		[actions, initialMarkdown, storedJson],
	);
	const editor = useEditor(options);

	if (!editor) {
		return (
			<div className="min-h-[60vh] rounded-xl border bg-card p-6 text-sm text-muted-foreground">
				Loading Tiptap…
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4" data-testid="tiptap-editor">
			<div className="rounded-xl border bg-card shadow-card">
				<FixedToolbar editor={editor} actions={actions} />
				<div className="relative">
					<EditorContent editor={editor} />
					<DragHandle editor={editor} className="tiptap-drag-handle">
						<GripVertical className="size-4" aria-label="Drag to move block" />
					</DragHandle>
					<SelectionBubble editor={editor} />
				</div>
				<StatusBar editor={editor} />
			</div>
			<input
				ref={fileInput}
				type="file"
				accept="image/*"
				hidden
				onChange={(event) => {
					const files = Array.from(event.target.files ?? []);
					event.target.value = "";
					void insertImageFiles(editor, files);
				}}
			/>
			<PromptDialog
				editor={editor}
				prompt={prompt}
				onClose={() => setPrompt(null)}
			/>
			<Extras toc={toc} />
		</div>
	);
}

export const editorModule: EditorModule = {
	meta,
	Editor,
	Rendered: TiptapRendered,
};
