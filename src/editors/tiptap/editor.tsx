import "katex/dist/katex.min.css";
import "./tiptap.css";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import type { TableOfContentDataItem } from "@tiptap/extension-table-of-contents";
import {
	EditorContent,
	type EditorEvents,
	type JSONContent,
	type Editor as TiptapEditor,
	useEditor,
	useEditorState,
} from "@tiptap/react";
import { Activity, GripVertical, ListTree, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { EditorProps, Snapshot } from "@/editors/types";
import { cn } from "@/lib/utils";
import { ImageBubble, SelectionBubble } from "./bubble";
import {
	createEditorActions,
	insertAudioFile,
	insertImageFiles,
} from "./editor-actions";
import { editorExtensions } from "./editor-extensions";
import { EmptyLineMenu } from "./floating-menu";
import { meta } from "./meta";
import { PromptDialog, type PromptState } from "./prompt-dialog";
import { DEFAULT_VIEW, type ViewSettings } from "./settings-menu";
import { FixedToolbar } from "./toolbar";

function snapshotOf(editor: TiptapEditor): Snapshot {
	return {
		json: editor.getJSON(),
		html: editor.getHTML(),
		markdown: editor.getMarkdown(),
	};
}

function StatusBar({ editor }: { editor: TiptapEditor }) {
	const counts = useEditorState({
		editor,
		selector: ({ editor: e }) => ({
			characters: e.storage.characterCount.characters(),
			words: e.storage.characterCount.words(),
			// NodePos API: editor.$nodes() queries the document like the DOM.
			headings: e.$nodes("heading")?.length ?? 0,
			images: e.$nodes("image")?.length ?? 0,
			editable: e.isEditable,
		}),
	});
	return (
		<div
			className="flex flex-wrap items-center justify-between gap-2 border-t bg-muted/60 px-4 py-2 font-label text-xs text-muted-foreground"
			data-testid="tiptap-status"
		>
			<span>
				{counts.words.toLocaleString()} words ·{" "}
				{counts.characters.toLocaleString()} characters · {counts.headings}{" "}
				headings · {counts.images} images
				{!counts.editable && (
					<span className="ml-2 rounded-sm bg-accent px-1.5 py-0.5 text-accent-foreground">
						read-only
					</span>
				)}
			</span>
			<span>
				Type <kbd className="font-mono">/</kbd> blocks ·{" "}
				<kbd className="font-mono">@</kbd> people ·{" "}
				<kbd className="font-mono">{"{{"}</kbd> variables ·{" "}
				<kbd className="font-mono">:</kbd> emoji ·{" "}
				<kbd className="font-mono">⌘K</kbd> link ·{" "}
				<kbd className="font-mono">⌘F</kbd> find
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

const EVENTS = [
	"create",
	"update",
	"selectionUpdate",
	"transaction",
	"focus",
	"blur",
	"paste",
	"drop",
	"delete",
	"contentError",
] as const satisfies ReadonlyArray<keyof EditorEvents>;

type EventName = (typeof EVENTS)[number];

/** editor.on(...) for every content event, counted live. */
function EventLog({ editor }: { editor: TiptapEditor }) {
	const [counts, setCounts] = useState<Record<string, number>>({ create: 1 });
	const [last, setLast] = useState<EventName>("create");
	useEffect(() => {
		const handlers = EVENTS.map((name) => {
			const handler = () => {
				setCounts((current) => ({
					...current,
					[name]: (current[name] ?? 0) + 1,
				}));
				setLast(name);
			};
			editor.on(name, handler);
			return () => editor.off(name, handler);
		});
		return () => {
			for (const off of handlers) off();
		};
	}, [editor]);
	return (
		<ul
			className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs"
			data-testid="tiptap-events"
		>
			{EVENTS.map((name) => (
				<li
					key={name}
					data-event={name}
					className={cn(
						"flex justify-between rounded-sm px-1.5",
						last === name && "bg-accent text-accent-foreground",
					)}
				>
					<span>{name}</span>
					<span>{counts[name] ?? 0}</span>
				</li>
			))}
		</ul>
	);
}

function Extras({
	editor,
	toc,
}: {
	editor: TiptapEditor;
	toc: TableOfContentDataItem[];
}) {
	return (
		<div className="grid gap-4 md:grid-cols-2">
			<section className="rounded-xl border p-4">
				<h2 className="eyebrow mb-2 flex items-center gap-2 text-primary-text">
					<ListTree className="size-4" /> Outline (TableOfContents)
				</h2>
				<Outline items={toc} />
			</section>
			<section className="rounded-xl border p-4">
				<h2 className="eyebrow mb-2 flex items-center gap-2 text-primary-text">
					<Activity className="size-4" /> Editor events (editor.on)
				</h2>
				<EventLog editor={editor} />
			</section>
			<section
				className="rounded-xl border p-4 md:col-span-2"
				data-testid="tiptap-showcase"
			>
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

/** The interactive editor; loaded lazily from index.tsx so the server bundle skips it. */
export default function Editor({
	initialMarkdown,
	storedJson,
	onChange,
}: EditorProps) {
	const onChangeRef = useRef(onChange);
	useEffect(() => {
		onChangeRef.current = onChange;
	});
	const imageInput = useRef<HTMLInputElement>(null);
	const audioInput = useRef<HTMLInputElement>(null);
	const [toc, setToc] = useState<TableOfContentDataItem[]>([]);
	const [prompt, setPrompt] = useState<PromptState | null>(null);
	const [linkOpen, setLinkOpen] = useState(false);
	const [findOpen, setFindOpen] = useState(false);
	const [view, setView] = useState<ViewSettings>(DEFAULT_VIEW);

	// Extensions call back into React through this (stable) object.
	const actions = useMemo(createEditorActions, []);
	actions.pickImage = () => imageInput.current?.click();
	actions.pickAudio = () => audioInput.current?.click();
	actions.prompt = (kind, initial, pos) =>
		setPrompt({ kind, value: initial ?? "", pos });
	actions.onToc = setToc;
	actions.openLink = () => setLinkOpen(true);
	actions.openFind = () => setFindOpen(true);

	const options = useMemo(
		() => ({
			immediatelyRender: false,
			extensions: editorExtensions(actions),
			content:
				storedJson !== null ? (storedJson as JSONContent) : initialMarkdown,
			contentType:
				storedJson !== null ? ("json" as const) : ("markdown" as const),
			// Invalid stored JSON raises `contentError` instead of throwing.
			enableContentCheck: true,
			onContentError: ({ error }: { error: Error }) =>
				toast.error(
					`Stored document did not match the schema: ${error.message}`,
				),
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
			<div
				className={cn(
					"rounded-xl border bg-card shadow-card",
					view.focusMode && "tiptap-focus-mode",
					view.blockLabels && "tiptap-block-labels",
				)}
			>
				<FixedToolbar
					editor={editor}
					actions={actions}
					linkOpen={linkOpen}
					onLinkOpenChange={setLinkOpen}
					findOpen={findOpen}
					onFindOpenChange={setFindOpen}
					view={view}
					onViewChange={setView}
				/>
				<div className="relative">
					<EditorContent editor={editor} />
					<DragHandle editor={editor} nested className="tiptap-drag-handle">
						<GripVertical className="size-4" aria-label="Drag to move block" />
					</DragHandle>
					<SelectionBubble editor={editor} actions={actions} />
					<ImageBubble editor={editor} actions={actions} />
					<EmptyLineMenu editor={editor} actions={actions} />
				</div>
				<StatusBar editor={editor} />
			</div>
			<input
				ref={imageInput}
				type="file"
				accept="image/*"
				hidden
				data-testid="tiptap-image-input"
				onChange={(event) => {
					const files = Array.from(event.target.files ?? []);
					event.target.value = "";
					void insertImageFiles(editor, files);
				}}
			/>
			<input
				ref={audioInput}
				type="file"
				accept="audio/*"
				hidden
				data-testid="tiptap-audio-input"
				onChange={(event) => {
					const file = event.target.files?.[0];
					event.target.value = "";
					if (file) void insertAudioFile(editor, file);
				}}
			/>
			<PromptDialog
				editor={editor}
				prompt={prompt}
				onClose={() => setPrompt(null)}
			/>
			<Extras editor={editor} toc={toc} />
		</div>
	);
}
