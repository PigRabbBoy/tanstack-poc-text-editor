export const FEATURE_GROUPS = [
	{
		id: "basics",
		label: "Rich text basics",
		features: [
			{ id: "marks", label: "Bold / italic / strike / code" },
			{ id: "headings", label: "Headings" },
			{ id: "lists", label: "Bullet & numbered lists" },
			{ id: "task-list", label: "Task list" },
			{ id: "link", label: "Links" },
			{ id: "blockquote", label: "Blockquote" },
			{ id: "code-block", label: "Code block (highlighted)" },
			{ id: "table", label: "Table" },
			{ id: "image", label: "Image (base64, ≤1 MB)" },
			{ id: "undo-redo", label: "Undo / redo" },
		],
	},
	{
		id: "blocks",
		label: "Notion-like blocks",
		features: [
			{ id: "slash-menu", label: "Slash command menu" },
			{ id: "drag-handle", label: "Drag handle to reorder blocks" },
			{ id: "floating-toolbar", label: "Floating selection toolbar" },
			{ id: "fixed-toolbar", label: "Fixed toolbar" },
			{ id: "markdown-shortcuts", label: "Markdown shortcuts while typing" },
		],
	},
	{
		id: "domain",
		label: "Domain data",
		features: [
			{ id: "mention", label: "@mention" },
			{ id: "variable", label: "{{variable}} atomic chip" },
			{ id: "markdown-import", label: "Markdown import" },
			{ id: "markdown-export", label: "Markdown export" },
			{ id: "html-export", label: "HTML export" },
			{ id: "static-render", label: "Read-only render from JSON" },
		],
	},
	{
		id: "platform",
		label: "Platform",
		features: [
			{ id: "ssr", label: "Works under TanStack Start SSR" },
			{ id: "thai-ime", label: "Thai typing (manual check)" },
		],
	},
] as const;

export type FeatureId =
	(typeof FEATURE_GROUPS)[number]["features"][number]["id"];

export const FEATURES: ReadonlyArray<{ id: FeatureId; label: string }> =
	FEATURE_GROUPS.flatMap(
		(group): ReadonlyArray<{ id: FeatureId; label: string }> => group.features,
	);
