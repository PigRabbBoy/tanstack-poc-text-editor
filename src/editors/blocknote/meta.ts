import type { EditorMeta, ToolEntry } from "@/editors/types";

const core = "@blocknote/core";
const react = "@blocknote/react";
const exporterNote = "Export menu above the editor";

const inventory: ToolEntry[] = [
	// Built-in blocks (docs: Features → Built-in Blocks)
	{
		name: "Paragraph",
		source: core,
		status: "included",
		howTo: "Slash menu → Paragraph, or the block type dropdown",
	},
	{
		name: "Heading (levels 1–6)",
		source: core,
		status: "included",
		howTo: "Slash menu → Heading 1–6, Mod+Alt+1…6, or # to ###### + space",
	},
	{
		name: "Toggle Heading",
		source: core,
		status: "included",
		howTo: "Slash menu → Toggle Heading 1–3 (allowToggleHeadings)",
	},
	{
		name: "Quote",
		source: core,
		status: "included",
		howTo: "Slash menu → Quote, or > + space",
	},
	{
		name: "Divider",
		source: core,
		status: "included",
		howTo: "Slash menu → Divider, or --- on an empty line",
	},
	{
		name: "Bullet List Item",
		source: core,
		status: "included",
		howTo: "Slash menu → Bullet List, or - + space",
	},
	{
		name: "Numbered List Item",
		source: core,
		status: "included",
		howTo: "Slash menu → Numbered List, or 1. + space",
	},
	{
		name: "Check List Item",
		source: core,
		status: "included",
		howTo: "Slash menu → Check List, or [] + space",
	},
	{
		name: "Toggle List Item",
		source: core,
		status: "included",
		howTo: "Slash menu → Toggle List",
	},
	{
		name: "Code Block",
		source: core,
		status: "included",
		howTo:
			"Slash menu → Code Block, or ``` + space; language picker on the block",
	},
	{
		name: "Syntax highlighting (syntaxHighlighter + codeBlockOptions)",
		source: "@blocknote/code-block",
		status: "included",
		howTo:
			"Code blocks and the LaTeX / Mermaid source popups are Shiki-highlighted",
	},
	{
		name: "Table",
		source: core,
		status: "included",
		howTo: "Slash menu → Table",
	},
	{
		name: "Split cells (merge / split)",
		source: core,
		status: "included",
		howTo:
			"Select several cells → merge button in the toolbar; cell menu → Split cell",
	},
	{
		name: "Cell background color / cell text color",
		source: core,
		status: "included",
		howTo: "Table cell menu (handle inside the cell) → Color",
	},
	{
		name: "Header rows & columns",
		source: core,
		status: "included",
		howTo: "Row / column handle menu → Header row / Header column",
	},
	{
		name: "Image",
		source: core,
		status: "included",
		howTo:
			"Slash menu → Image → Upload (base64, ≤1 MB) or Embed; drag the edges to resize",
	},
	{
		name: "Video",
		source: core,
		status: "included",
		howTo: "Slash menu → Video",
	},
	{
		name: "Audio",
		source: core,
		status: "included",
		howTo: "Slash menu → Audio",
	},
	{
		name: "File",
		source: core,
		status: "included",
		howTo: "Slash menu → File",
	},
	{
		name: "Page Break",
		source: core,
		status: "included",
		howTo:
			"Slash menu → Page Break (withPageBreak); a real page break in PDF/DOCX/ODT",
	},
	{
		name: "Math block (Block Equation)",
		source: "@blocknote/math-block",
		status: "included",
		howTo: "Slash menu → Block Equation; click the formula to edit its LaTeX",
	},
	{
		name: "Inline math (Inline Equation)",
		source: "@blocknote/math-block",
		status: "included",
		howTo: "Slash menu → Inline Equation",
	},
	{
		name: "Diagram (Mermaid)",
		source: "@blocknote/diagram-block",
		status: "included",
		howTo: "Slash menu → Diagram; click it to edit the Mermaid source",
	},
	{
		name: "Columns (Column / Column List)",
		source: "@blocknote/xl-multi-column",
		status: "included",
		howTo:
			"Slash menu → Two / Three Columns, or drag a block to the side of another",
	},
	{
		name: "Multi-column drop cursor",
		source: "@blocknote/xl-multi-column",
		status: "included",
		howTo: "Drag a block by its handle next to another block",
	},
	{
		name: "Default block props (text color, background color, text alignment)",
		source: core,
		status: "included",
		howTo: "Toolbar colour and alignment buttons; drag handle menu → Colors",
	},
	// Inline content & styles
	{
		name: "Styled text: bold, italic, underline, strike, code",
		source: core,
		status: "included",
		howTo:
			"Toolbar buttons, Mod+B / Mod+I / Mod+U, or **, *, ~~, ` while typing",
	},
	{
		name: "Text color & background color styles",
		source: core,
		status: "included",
		howTo: "Toolbar → Colors (A)",
	},
	{
		name: "Link",
		source: core,
		status: "included",
		howTo: "Toolbar link button or Mod+K",
	},
	// Custom schemas
	{
		name: "Custom Block Types (Alert block example)",
		source: react,
		status: "included",
		howTo: "Slash menu → Alert; click its icon to change the type",
	},
	{
		name: "Custom Inline Content Types (variable & mention chips)",
		source: react,
		status: "included",
		howTo: "Type {{ or @, or use the {} and @ toolbar buttons",
	},
	{
		name: "Custom Style Types (Font style example)",
		source: react,
		status: "included",
		howTo: "Select text → font dropdown in the toolbar",
	},
	{
		name: "Source with Preview Blocks",
		source: react,
		status: "included",
		howTo: "Math and Diagram blocks: preview in place, source in a popup",
	},
	// React UI components (docs: React → UI Components)
	{
		name: "Formatting Toolbar",
		source: react,
		status: "included",
		howTo: "Select text (floating), and pinned above the editor",
	},
	{
		name: "Block Type Select items",
		source: react,
		status: "included",
		howTo:
			"First dropdown of the toolbar; includes Equation, Diagram and Alert",
	},
	{
		name: "Mobile Formatting Toolbar",
		source: react,
		status: "included",
		howTo: "Automatic on touch devices while the on-screen keyboard is open",
	},
	{
		name: "Link Toolbar",
		source: react,
		status: "included",
		howTo: "Hover a link: edit, open or remove it",
	},
	{
		name: "Slash Menu",
		source: react,
		status: "included",
		howTo: "Type / — grouped items merged with combineByGroup",
	},
	{
		name: "Suggestion Menus (custom triggers)",
		source: react,
		status: "included",
		howTo: "Type @ (mentions) or {{ (variables)",
	},
	{
		name: "Opening Suggestion Menus Programmatically",
		source: core,
		status: "included",
		howTo: "Toolbar {} and @ buttons; slash menu → Variable / Mention",
	},
	{
		name: "Emoji Picker (Grid Suggestion Menu)",
		source: react,
		status: "included",
		howTo: "Type : followed by two letters, or slash menu → Emoji",
	},
	{
		name: "Block Side Menu (add block, drag handle)",
		source: react,
		status: "included",
		howTo: "Hover a block: + inserts below, ⠿ drags it",
	},
	{
		name: "Drag Handle Menu (delete, colors, table headers)",
		source: react,
		status: "included",
		howTo: "Click the ⠿ handle",
	},
	{
		name: "File Panel (upload / embed)",
		source: react,
		status: "included",
		howTo: "Insert an Image, Video, Audio or File block",
	},
	{
		name: "File toolbar buttons (caption, replace, rename, delete, download, preview)",
		source: react,
		status: "included",
		howTo: "Select a file or image block",
	},
	{
		name: "Table Handles",
		source: react,
		status: "included",
		howTo: "Hover a table: row / column handles, + extend buttons, cell menu",
	},
	{
		name: "Placeholders",
		source: core,
		status: "included",
		howTo: "Empty blocks; the Thai dictionary overrides them",
	},
	// Features
	{
		name: "Comments (CommentsExtension, threads, replies, reactions)",
		source: `${core}/comments`,
		status: "included",
		howTo:
			"Select text → comment button in the toolbar. Local YjsThreadStore, kept for the visit",
	},
	{
		name: "Threads Sidebar",
		source: react,
		status: "included",
		howTo: "Comments button above the editor (filter and sort)",
	},
	{
		name: "Versioning (VersioningExtension + VersioningSidebar, in-memory)",
		source: `${core}/extensions`,
		status: "included",
		howTo: "History button: save, preview, rename and restore snapshots",
	},
	{
		name: "Localization (i18n)",
		source: `${core}/locales`,
		status: "included",
		howTo: "UI: menu — 23 BlockNote locales plus a custom Thai dictionary",
	},
	{
		name: "Read-only editor",
		source: react,
		status: "included",
		howTo: "Editing / Read-only button; the Rendered preview tab",
	},
	{
		name: "Undo / Redo",
		source: core,
		status: "included",
		howTo: "Toolbar arrows, Mod+Z / Mod+Shift+Z",
	},
	{
		name: "Keyboard shortcuts",
		source: core,
		status: "included",
		howTo:
			"Mod+B/I/U, Mod+K, Mod+Alt+0–6 and Mod+Shift+6–9 (badges in the slash menu), Tab / Shift+Tab, Mod+Shift+↑/↓ (move block)",
	},
	{
		name: "Markdown shortcuts (input rules)",
		source: core,
		status: "included",
		howTo: "#, -, 1., [], >, ```, --- and **, *, `, ~~ while typing",
	},
	{
		name: "Nesting blocks",
		source: core,
		status: "included",
		howTo: "Tab / Shift+Tab, or the nest buttons in the toolbar",
	},
	{
		name: "Trailing block",
		source: core,
		status: "included",
		howTo: "There is always an empty paragraph at the end to type into",
	},
	{
		name: "Paste handling (markdown / HTML detection)",
		source: core,
		status: "included",
		howTo: "Paste markdown or HTML into the editor",
	},
	{
		name: "Paste APIs (pasteHTML, pasteMarkdown)",
		source: core,
		status: "included",
		howTo: "Import menu → Paste HTML / markdown at cursor",
	},
	{
		name: "Manipulating Content API (move, nest, insert, remove, transact)",
		source: core,
		status: "included",
		howTo: "Block menu above the editor",
	},
	{
		name: "Events & selection (onChange, useSelectedBlocks, useEditorFocus)",
		source: react,
		status: "included",
		howTo: "Status line under the editor; every change updates the preview",
	},
	{
		name: "Theming (CSS variables) & shadcn components",
		source: "@blocknote/shadcn",
		status: "included",
		howTo: "--bn-* variables mapped to BML tokens; app Button/Input/… injected",
	},
	// Interoperability (docs: Import / Export)
	{
		name: "Markdown import (tryParseMarkdownToBlocks)",
		source: core,
		status: "included",
		howTo: "Import MD button",
	},
	{
		name: "Markdown export (blocksToMarkdownLossy)",
		source: core,
		status: "included",
		howTo: "Export MD button and the Markdown tab",
	},
	{
		name: "HTML import (tryParseHTMLToBlocks)",
		source: core,
		status: "included",
		howTo: "Import menu → Replace with HTML",
	},
	{
		name: "HTML export (blocksToHTMLLossy)",
		source: core,
		status: "included",
		howTo: "HTML tab; Export → Interoperable HTML",
	},
	{
		name: "BlockNote HTML export (blocksToFullHTML)",
		source: core,
		status: "included",
		howTo: "Export → BlockNote HTML",
	},
	{
		name: "PDF export (Typst, PDF/UA)",
		source: "@blocknote/xl-pdf-exporter",
		status: "included",
		howTo: `${exporterNote} → PDF/UA (Typst wasm, Anuphan for Thai)`,
	},
	{
		name: "PDF export (react-pdf, deprecated)",
		source: "@blocknote/xl-pdf-exporter/react-pdf",
		status: "included",
		howTo: `${exporterNote} → PDF (react-pdf)`,
	},
	{
		name: "DOCX export",
		source: "@blocknote/xl-docx-exporter",
		status: "included",
		howTo: `${exporterNote} → Word (.docx)`,
	},
	{
		name: "ODT export",
		source: "@blocknote/xl-odt-exporter",
		status: "included",
		howTo: `${exporterNote} → OpenDocument (.odt)`,
	},
	{
		name: "Email export (React Email)",
		source: "@blocknote/xl-email-exporter",
		status: "included",
		howTo: `${exporterNote} → Email HTML`,
	},
	{
		name: "Typst export",
		source: "@blocknote/xl-typst-exporter",
		status: "included",
		howTo: `${exporterNote} → Typst markup (.typ)`,
	},
	// Excluded
	{
		name: "AI (xl-ai: AI menu, toolbar button, slash item)",
		source: "@blocknote/xl-ai",
		status: "excluded",
		reason: "Needs an LLM key / endpoint (Q14/Q15).",
	},
	{
		name: "AI server (xl-ai-server)",
		source: "@blocknote/xl-ai-server",
		status: "excluded",
		reason: "LLM proxy server for xl-ai (Q14/Q15).",
	},
	{
		name: "Real-time collaboration (withCollaboration, cursors; PartyKit, Liveblocks, Y-Sweet, ElectricSQL, Hocuspocus)",
		source: `${core}/yjs`,
		status: "excluded",
		reason: "Needs a sync server / provider (Q14/Q15).",
	},
	{
		name: "Suggestions / track changes (SuggestionsExtension, attribution tooltip)",
		source: `${core}/y`,
		status: "excluded",
		reason:
			"Experimental and collaboration-only: the document must live in a Yjs v14 (@y/y release candidate) fragment via withCollaboration, which replaces initialContent and the JSON stored in localStorage.",
	},
	{
		name: "Version diffs (DiffVersioningExtension)",
		source: `${core}/y`,
		status: "excluded",
		reason:
			"Needs the Yjs v14 release candidates (@y/y, @y/prosemirror). BlockNote patches @y/prosemirror 2.0.0-6 in its monorepo; the npm builds lack the exports core/y imports (deltaAttributionToFormat, pmToFragment). History still previews and restores, without diff highlighting.",
	},
	{
		name: "Forking (ForkYDocExtension)",
		source: `${core}/yjs`,
		status: "excluded",
		reason: "Forks a shared Y.Doc; part of collaboration (Q14/Q15).",
	},
	{
		name: "YJS Utilities (blocksToYDoc, yDocToBlocks…)",
		source: `${core}/yjs`,
		status: "excluded",
		reason:
			"Converters for a collaboration backend; this page stores block JSON, so there is no Y.Doc to show (Q14/Q15).",
	},
	{
		name: "RESTYjsThreadStore / TiptapThreadStore",
		source: `${core}/comments`,
		status: "excluded",
		reason:
			"Comment stores backed by a REST API or Tiptap Cloud; comments here use the local YjsThreadStore.",
	},
	{
		name: "Server-side processing (ServerBlockNoteEditor)",
		source: "@blocknote/server-util",
		status: "excluded",
		reason:
			"Node-only (jsdom) conversion on a server; the POC has no backend (ADR-0004) and editors are client-only (ADR-0001).",
	},
	{
		name: "Mantine UI (@blocknote/mantine)",
		source: "@blocknote/mantine",
		status: "excluded",
		reason:
			"Alternative skin for the same components; this page uses the shadcn skin (ADR-0003) and Mantine brings its own theme and global CSS.",
	},
	{
		name: "Ariakit UI (@blocknote/ariakit)",
		source: "@blocknote/ariakit",
		status: "excluded",
		reason:
			"Alternative skin for the same components; this page uses the shadcn skin (ADR-0003).",
	},
	{
		name: "Dark theme / theme switching",
		source: react,
		status: "excluded",
		reason: "The app is light-only (ADR-0007).",
	},
	{
		name: "Uppy file panel / S3 uploads (examples)",
		source: "@uppy/*",
		status: "excluded",
		reason:
			"Need an upload service; files here are base64 data URLs (ADR-0004).",
	},
	{
		name: "resolveFileUrl (signed file URLs)",
		source: core,
		status: "excluded",
		reason: "No remote file storage to sign URLs for; files are data URLs.",
	},
	{
		name: "Vanilla JS UI (custom side menu etc.)",
		source: core,
		status: "excluded",
		reason: "This is a React app; the React components cover the same UI.",
	},
];

export const meta: EditorMeta = {
	id: "blocknote",
	name: "BlockNote",
	tagline:
		"Notion-style block editor (ProseMirror/Tiptap underneath) with its whole UI included — shadcn skin.",
	homepage: "https://www.blocknotejs.org",
	packages: [
		"@blocknote/core",
		"@blocknote/react",
		"@blocknote/shadcn",
		"@blocknote/code-block",
		"@blocknote/math-block",
		"@blocknote/diagram-block",
		"@blocknote/xl-multi-column",
		"@blocknote/xl-pdf-exporter",
		"@blocknote/xl-typst-exporter",
		"@blocknote/xl-typst-compiler",
		"@blocknote/xl-docx-exporter",
		"@blocknote/xl-odt-exporter",
		"@blocknote/xl-email-exporter",
		"@react-pdf/renderer",
		"yjs",
		"y-prosemirror",
		"docx",
		"@react-email/components",
		"tex2typst",
		"mathml2omml",
		"mathjax-full",
		"@expo-google-fonts/anuphan",
	],
	uiApproach:
		"Official @blocknote/shadcn skin: side menu, slash menu, floating formatting toolbar, link toolbar, table handles, file panel, emoji picker, comment composer/threads and the threads and version sidebars all come built in, styled by the app's shadcn CSS variables (Tailwind @source on the package) plus a few --bn-* overrides. Our own radix shadcn leaf components (Button, Input, Label, Badge, Card, Skeleton, Toggle) are injected via `shadCNComponents`; menus, popovers, tooltips, selects and tabs must stay on BlockNote's bundled Base UI versions. The fixed toolbar is BlockNote's FormattingToolbar rendered statically (renderEditor={false} + BlockNoteViewEditor). The tools row above it (Export, Import, Block, Comments, History, Read-only, UI language) uses the app's own shadcn components. We wrote the mention/variable inline content, the Alert block and Font style (from the docs' custom-schema examples), the @ and {{ pickers, the markdown/HTML bridge and the exporter mappings for our own types.",
	features: {
		marks: {
			status: "builtin",
			note: "Bold, italic, underline, strike, inline code, text and background colours, plus a custom Font style.",
		},
		headings: {
			status: "builtin",
			note: "H1–H6 plus collapsible toggle headings.",
		},
		lists: {
			status: "builtin",
			note: "Bullet, numbered and toggle lists. Tab/Shift-Tab nest blocks.",
		},
		"task-list": { status: "builtin", note: "Check list block." },
		link: {
			status: "builtin",
			note: "Link toolbar to edit, open or remove a link. `mention:` hrefs need `links.isValidLink`.",
		},
		blockquote: { status: "builtin" },
		"code-block": {
			status: "kit",
			note: "@blocknote/code-block adds Shiki highlighting and a language picker. Languages are normalised (``` → text, ```ts → typescript, unknown → text) because the picker throws on any value outside its list.",
		},
		table: {
			status: "builtin",
			note: "Header rows and columns, merging and splitting cells, cell colours, column resize, and row/column handles. Markdown cannot represent merged cells.",
		},
		image: {
			status: "builtin",
			note: "`uploadFile` is wired to fileToDataUrl. A file over 1 MB shows a toast and the file panel shows 'Upload failed'. Images are resizable and have captions.",
		},
		"undo-redo": {
			status: "builtin",
			note: "History and Mod+Z are built in. The toolbar buttons are ours and call editor.undo()/redo().",
		},
		"slash-menu": {
			status: "builtin",
			note: "Defaults merged with page break, columns, math and diagram items (combineByGroup), plus our Alert, Variable and Mention items.",
		},
		"drag-handle": {
			status: "builtin",
			note: "Side menu with a + button and a drag handle. Its menu has Delete and Colors. Dropping beside a block creates columns.",
		},
		"floating-toolbar": { status: "builtin" },
		"fixed-toolbar": {
			status: "partial",
			note: "No fixed-toolbar mode. We render the built-in FormattingToolbar component statically above the editor. It wraps to two rows at half width.",
		},
		"markdown-shortcuts": {
			status: "builtin",
			note: "Verified #, -, 1., [], >, ```, --- and **, *, `, ~~ while typing.",
		},
		mention: {
			status: "custom",
			note: "createReactInlineContentSpec with content 'none', plus a SuggestionMenuController on '@'.",
		},
		variable: {
			status: "custom",
			note: "Atomic inline content (content 'none'). Typing '{{' opens a picker: multi-character triggers are supported natively. The slash item opens the same picker.",
		},
		"markdown-import": {
			status: "partial",
			note: "tryParseMarkdownToBlocks, then our pass that splits `{{name}}` text and `mention:` links into chips. Styles around a chip are lost: `**{{contract_id}}**` comes back as `{{contract_id}}`.",
		},
		"markdown-export": {
			status: "partial",
			note: "blocksToMarkdownLossy after turning chips back into text and links. The second round-trip is lossless. The first one normalises `-`→`*`, `---`→`***`, ```ts→```typescript and table padding, and turns soft breaks into `\\` hard breaks.",
		},
		"html-export": {
			status: "partial",
			note: "blocksToHTMLLossy (semantic HTML) plus our toExternalHTML spans. Post-processing removes BlockNote's node-view wrapper span and a stray `classname` attribute. DOCX, ODT, PDF, email and Typst exporters are on the Export menu.",
		},
		"static-render": {
			status: "builtin",
			note: "Read-only BlockNoteView (editable={false}) fed with editor.document.",
		},
		ssr: {
			status: "partial",
			note: "BlockNote cannot render on the server. The editor and the renderer are React.lazy chunks inside ClientOnly, the SSR build drops those imports entirely, and every exporter loads only when used.",
		},
		"thai-ime": {
			status: "partial",
			note: "Manual check needed. Playwright keyboard.type inserts Thai text, but that is not real IME composition.",
		},
	},
	showcase: [
		"The document is block JSON (editor.document). Every block has an id, a type, props (text colour, background colour, alignment) and nested children.",
		"Notion-style side menu: '+' inserts a block, the drag handle reorders it (or drops it beside another block to make columns), and its menu deletes the block or sets colours.",
		"Slash menu with page break, two/three columns, block and inline equations (LaTeX), Mermaid diagrams, an Alert callout and our Variable/Mention items.",
		"Export to Word, OpenDocument, PDF/UA (Typst compiled to wasm in the browser, with Anuphan for Thai), react-pdf, React Email HTML and Typst markup — all client-side.",
		"Comments with replies, reactions and resolve, plus a threads sidebar, using a local YjsThreadStore (no server).",
		"Version history: save, preview, rename and restore snapshots in the History panel.",
		"Code blocks highlighted by Shiki with a language picker; tables with merge/split, header rows and cell colours.",
		"UI dictionary switch across BlockNote's 23 locales plus a Thai override (UI: menu).",
		"Native multi-character trigger: typing '{{' opens the variable picker and '@' opens the mention picker.",
		"The Rendered tab is the same BlockNoteView with editable={false}, so the preview looks exactly like the editor.",
	],
	findings: [
		"@blocknote/shadcn 0.55 is built on Base UI and composes triggers with `render={…}`, while the docs still describe Radix. Passing our radix Tooltip or DropdownMenu through `shadCNComponents` made every toolbar button and the drag handle disappear. Only leaf components (Button, Input, Label, Badge, Card, Skeleton, Toggle) can be swapped in.",
		"Markdown import silently drops `[@x](mention:u1)` links: the link mark only allows http, mailto and similar. The fix is `links.isValidLink`. Its JSDoc says to import `isAllowedUri` from @blocknote/core, but 0.55 does not export it.",
		'blocksToHTMLLossy wraps React inline content in its node-view wrapper (`<span as="span" data-node-view-wrapper …>`), except inside table cells, and puts a literal `classname` attribute on links. In dev, TanStack devtools also stamps `data-tsd-source` on toExternalHTML output. We post-process all three away.',
		"Exporting HTML or markdown renders React inline content through flushSync. Calling it from useEffect floods the console with 'flushSync was called from inside a lifecycle method', so serialisation runs on a setTimeout task.",
		"The earlier code-block crash had three sources, not one: the language <select> throws 'Language X is not supported.' for '' (the ``` shortcut), for aliases (markdown import keeps ```ts as 'ts' instead of 'typescript') and for unknown fences. Adding '' as a Plain Text alias, an appendTransaction guard and normalising loaded JSON fixes all three.",
		"@blocknote/math-block 0.55 returns no external HTML for an empty or invalid formula, and BlockNote's HTML serializer then throws reading `firstChild.classList` — on every keystroke while a formula is typed, and in markdown export too. We drop empty math blocks and export invalid LaTeX as `$$…$$` text before serialising.",
		"0.55 replaced the react-pdf PDF exporter with Typst compiled to wasm (24.7 MiB, just under Cloudflare's 25 MiB per-asset limit); react-pdf lives on at `/react-pdf` as deprecated. Neither bundled font covers Thai: we load Anuphan TTF (@expo-google-fonts/anuphan) as Typst's fallback family, and for react-pdf also split Thai words with Intl.Segmenter (it only breaks at spaces, and adds a hyphen at each break). The sample exports as declared PDF/UA-1.",
		"The Typst compiler finds its wasm with `new URL(…, import.meta.url)`, which points into Vite's pre-bundle cache in dev, so the URL is passed explicitly (`@blocknote/xl-typst-compiler/wasm?url`). The docs also mention a DEFAULT_FONT_FAMILY export that 0.55 does not have.",
		"Exporters fetch images through BlockNote's hosted CORS proxy by default, which cannot reach data URLs or our same-origin /brand/wordmark.png. A resolveFileUrl that fetches directly fixes it. The math and diagram packages ship DOCX/ODT/email/Typst mappings but none for react-pdf, so there their source is exported as code.",
		"Comments run without a server: CommentsExtension with a YjsThreadStore over a local Y.Doc (BlockNote's own comments-testing setup). The comment mark is `blocknoteIgnore`, so its anchors are not in editor.document and comments do not survive a reload or a UI-language switch.",
		"The in-memory versioning adapter needs no Yjs, but its diff view (DiffVersioningExtension) imports @y/y and @y/prosemirror release candidates, and BlockNote patches @y/prosemirror in its own monorepo.",
		"A custom block's parse rule loses to the paragraph's `<p>` rule (same priority, earlier in the schema), so the Alert block exports as `<div role=\"note\" data-alert-type>` to round-trip through HTML.",
		"@blocknote/math-block imports KaTeX CSS from its entry point, which Node cannot load, so the Vitest suite stubs the math specs. diagram-block imports mermaid statically, so mermaid is part of the editor chunk.",
		"The react-pdf and ODT exporters log React duplicate-key warnings while exporting (keys come from text content inside BlockNote's mappings). Columns and diagrams can trigger a benign 'ResizeObserver loop' error in the dev overlay.",
		"BlockNote is client-only, but the SSR (Worker) build still followed the editor's lazy import() and emitted every chunk behind it: with the exporters that put about 18 MB gzip (Typst's emoji and math fonts, react-pdf, Mermaid) into the Worker upload. index.tsx now skips the import when import.meta.env.SSR, which took `wrangler deploy --dry-run` from 28.8 MB to 10.4 MB gzip; the rest comes from the other editors, and Cloudflare's paid limit is 10 MB.",
		"In dev, TanStack's devtools Vite plugin stamps `data-tsd-source` on every JSX element under src/. BlockNote's shadcn toolbar Select asserts it gets no unknown props and throws 'Object must be empty', which crashed the whole editor, so the Font select is built with createElement.",
		"The UI dictionary is a creation option, so switching language re-creates the editor via useCreateBlockNote deps, and the document (plus the comment and version stores, which live outside the editor) has to be carried over by hand.",
	],
	inventory,
};
