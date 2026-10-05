import type { EditorMeta } from "@/editors/types";

export const meta: EditorMeta = {
	id: "lexical",
	name: "Lexical",
	tagline:
		"Meta's framework-agnostic editor engine, dressed with the community shadcn-editor (editor-x) registry.",
	homepage: "https://lexical.dev",
	packages: [
		"lexical",
		"@lexical/react",
		"@lexical/extension",
		"@lexical/rich-text",
		"@lexical/list",
		"@lexical/link",
		"@lexical/table",
		"@lexical/markdown",
		"@lexical/html",
		"@lexical/history",
		"@lexical/selection",
		"@lexical/utils",
		"@lexical/code-core",
		"@lexical/code-shiki",
		"@lexical/file",
		"@base-ui/react",
		"katex",
		"emojibase-data",
		"date-fns",
		"react-day-picker",
		"cmdk",
	],
	uiApproach:
		"Lexical 0.52 extension API (LexicalExtensionComposer + defineExtension) composed by hand from the community shadcn-editor registry item @shadcn-editor/editor-x (MIT, copied into src/editors/lexical with its own base-ui shadcn primitives). We added the {{variable}} DecoratorTextNode, the {{ typeahead, slash items, markdown transformers, USERS-backed mentions and BML theme overrides.",
	features: {
		marks: {
			status: "builtin",
			note: "Core TextNode formats; toolbar + floating toolbar from the registry (also sub/superscript, highlight, case, colour, font family/size).",
		},
		headings: { status: "builtin", note: "@lexical/rich-text HeadingNode." },
		lists: {
			status: "builtin",
			note: "@lexical/list; nested lists export with 4-space indent.",
		},
		"task-list": {
			status: "builtin",
			note: "CheckListExtension (- [ ] / - [x]).",
		},
		link: {
			status: "builtin",
			note: "@lexical/link + AutoLink; floating link editor from the registry.",
		},
		blockquote: { status: "builtin" },
		"code-block": {
			status: "builtin",
			note: "@lexical/code-shiki (Shiki, lazy-loaded grammars) with line numbers.",
		},
		table: {
			status: "kit",
			note: "@lexical/table nodes; markdown TABLE transformer + hover actions are registry code (made into a factory so cells parse variables/mentions).",
		},
		image: {
			status: "kit",
			note: "Registry ImageNode (resizable, caption). Upload/drop/paste routed through fileToDataUrl with a toast over 1 MB.",
		},
		"undo-redo": { status: "builtin", note: "HistoryExtension." },
		"slash-menu": {
			status: "kit",
			note: "Registry ComponentPicker on LexicalTypeaheadMenuPlugin; we registered Variable items.",
		},
		"drag-handle": {
			status: "kit",
			note: "DraggableBlockPlugin_EXPERIMENTAL (official, experimental) wrapped by the registry with a + button.",
		},
		"floating-toolbar": { status: "kit" },
		"fixed-toolbar": {
			status: "kit",
			note: "Many buttons; the registry scrolls them sideways, so the POC wraps them onto extra rows.",
		},
		"markdown-shortcuts": {
			status: "builtin",
			note: "registerMarkdownShortcuts with the same transformers (typing {{name}} converts too).",
		},
		mention: {
			status: "custom",
			note: "Registry MentionNode/plugin adapted: carries a user id, reads USERS, exports the shared HTML/markdown.",
		},
		variable: {
			status: "custom",
			note: "DecoratorTextNode (inline, keeps bold/italic), custom {{ trigger matcher, slash items and TextMatchTransformer.",
		},
		"markdown-import": {
			status: "builtin",
			note: "$convertFromMarkdownString + our MENTION/VARIABLE transformers placed before LINK.",
		},
		"markdown-export": {
			status: "partial",
			note: "Round-trip on the sample is lossless (idempotent). Normalises *** / nested indent; registry blocks (collapsible, poll, card, review, columns, embeds) have no markdown form and are dropped or flattened.",
		},
		"html-export": {
			status: "builtin",
			note: "$generateHtmlFromNodes; our nodes' exportDOM emit the shared data attributes.",
		},
		"static-render": {
			status: "builtin",
			note: "A second Lexical editor with editable: false loads the JSON (not a static string renderer).",
		},
		ssr: {
			status: "partial",
			note: "Route SSR works, but the editor/preview are React.lazy client-only; Lexical renders nothing on the server.",
		},
		"thai-ime": {
			status: "partial",
			note: "Manual check. Playwright keyboard.type of Thai text works (not real IME composition).",
		},
	},
	showcase: [
		"Find & replace panel with case/regex options (toolbar search icon).",
		"Shiki code highlighting with line numbers; language grammars load on demand.",
		"Slash menu blocks unique to the registry: Collapsible, Columns, Card, Pull quote, Review (stars), Poll, Date & time chip.",
		"Equations (KaTeX), emoji picker (type :), ruby text (furigana) from the toolbar.",
		"YouTube / X (Twitter) / Figma embeds — insert from the toolbar or paste a URL (auto-embed).",
		"Word + character count using Intl.Segmenter (counts Thai words without spaces).",
		"Read-only toggle, keyboard-shortcut sheet and Web Speech API dictation in the bottom bar.",
		"Right-click context menu, table hover actions (+ row / + column), font family / size / colour.",
		"Export/import the raw editor state as a .lexical JSON file.",
		"Type {{ for the variable picker, or type a full {{name}} to convert it via markdown shortcut.",
	],
	findings: [
		"Lexical 0.52's extension API (LexicalExtensionComposer/defineExtension) supersedes LexicalComposer, which is now marked @deprecated; the registry targets 0.50 but typechecks on 0.52.",
		"All @lexical/* packages are ESM-only (type: module); no issues with Vite 8, vitest or React 19.2.",
		"The registry ships extensions/plugins/nodes but no top-level editor component; we composed it from the README. The README imports @lexical/hashtag and @lexical/clipboard (not installed) and a DirectionProvider that is not vendored — all dropped.",
		"Registry SpecialTextExtension turns every [text] into a node, breaking typed markdown links and [@mention](...) syntax; excluded. Autocomplete (EN/AR/HE word lists) and AI excluded; chat/comment plugins left unused.",
		"useBasicTypeaheadTriggerMatch only takes one trigger char; {{ needed a custom regex matcher. Typeahead plugins coexist (/, @, :, {{).",
		"Markdown: text-match transformers must precede LINK or [@x](mention:u1) becomes a link. DecoratorTextNode keeps text format, but Lexical's exportFormat helper only accepts TextNodes, so bold/italic around a chip is wrapped manually.",
		"The registry TABLE transformer hard-codes its cell transformers; we turned it into a factory so {{amount}} in a cell becomes a chip.",
		"Mention was a TextNode keyed only by display name with a Star Wars list behind a fake 250 ms lookup; we added an id and USERS.",
		"buildEditorFromExtensions applies $initialEditorState asynchronously; in unit tests use editor.update(..., { discrete: true }). React-dependent extensions also need ReactProviderExtension when headless.",
		"Bundle: the route lazy-loads ~245 kB editor chunk + ~1.8 MB shared chunk (≈470 kB gzip: lexical, base-ui, KaTeX, emojibase, Shiki core) plus per-language Shiki chunks.",
		"Speech-to-text uses the browser Web Speech API (free, but Chrome sends audio to Google); kept, disabled when unsupported.",
		"`pnpm typecheck` runs `tsr generate`, which rewrites src/routeTree.gen.ts without the Start Register block (differs from the Vite plugin output).",
	],
};
