import type { EditorMeta, ToolEntry } from "@/editors/types";

const AI =
	"AI feature: needs an LLM key/endpoint (user decision Q14, ADR-0005).";
const COLLAB =
	"Real-time collaboration: needs a Yjs sync provider/server (user decision Q15, ADR-0005).";
const DEV = "Dev tooling, not an editor feature.";

const included = (name: string, source: string, howTo: string): ToolEntry => ({
	name,
	source,
	status: "included",
	howTo,
});
const excluded = (name: string, source: string, reason: string): ToolEntry => ({
	name,
	source,
	status: "excluded",
	reason,
});

/**
 * Every page under platejs.org/docs (plugins, serializing, guides with a
 * user-facing feature, examples) plus every kit/UI item in
 * platejs.org/r/registry.json, grouped as the docs sidebar groups them.
 */
const inventory: ToolEntry[] = [
	// Elements
	included(
		"Basic Blocks",
		"@platejs/basic-nodes · basic-blocks-kit",
		"Paragraph, headings, blockquote, divider: slash menu, Insert, Turn into, block menu, markdown shortcuts.",
	),
	included(
		"Heading",
		"@platejs/basic-nodes",
		"Slash → Heading 1–6, Turn into, `#`…`######` + space, ⌘⌥1–6.",
	),
	included(
		"Blockquote",
		"@platejs/basic-nodes",
		"Slash → Blockquote, `> `, ⌘⇧.",
	),
	included(
		"Horizontal Rule",
		"@platejs/basic-nodes",
		"Slash or Insert → Divider, `---`.",
	),
	included(
		"Callout",
		"@platejs/callout · callout-kit",
		"Slash or Insert → Callout; click the emoji to change it.",
	),
	included(
		"Code Block",
		"@platejs/code-block · code-block-kit",
		"Slash → Code Block or ```; language picker, lowlight highlighting, copy button.",
	),
	included(
		"Code Drawing",
		"@platejs/code-drawing · code-drawing-kit",
		"Slash → Code Drawing (Mermaid, PlantUML, Graphviz, Flowchart; code/preview/both).",
	),
	included(
		"Column",
		"@platejs/layout · column-kit",
		"Slash or Insert → 2 / 3 / 4 columns, Turn into → 3 columns; drag blocks between columns.",
	),
	included(
		"Date",
		"@platejs/date · date-kit",
		"Slash → Date (inline); click it for the calendar.",
	),
	included(
		"Equation",
		"@platejs/math · math-kit",
		"Slash → Equation / Inline Equation, toolbar √ (Mark as equation), `$$` + Enter or `$…$`.",
	),
	included(
		"Excalidraw",
		"@platejs/excalidraw · excalidraw-kit",
		"Slash or Insert → Excalidraw.",
	),
	included(
		"Footnote",
		"@platejs/footnote · footnote-kit",
		"Slash → Footnote or type `[^`; click a reference to jump to its definition.",
	),
	included(
		"Link",
		"@platejs/link · link-kit",
		"Toolbar Link or ⌘K, floating link toolbar (edit / open / unlink), autolink on paste or space.",
	),
	included(
		"List Classic",
		"@platejs/list-classic · list-classic-kit",
		"Plate lab → List Classic: nested ul/ol/li and task lists, `- ` / `1. `, Tab to nest.",
	),
	included(
		"Media: Image",
		"@platejs/media · media-kit",
		"Toolbar Image (upload → base64 ≤1 MB, or URL), slash → Image; resize handles, align, caption, preview dialog.",
	),
	included(
		"Media: Video",
		"@platejs/media · react-player",
		"Toolbar Video or slash → Video (upload or URL).",
	),
	included("Media: Audio", "@platejs/media", "Toolbar Audio or slash → Audio."),
	included(
		"Media: File",
		"@platejs/media",
		"Toolbar File or slash → File (download link card).",
	),
	included(
		"Media: Embed",
		"@platejs/media · react-lite-youtube-embed · react-tweet",
		"Toolbar Embed or slash → Embed: paste a YouTube, Vimeo or X URL.",
	),
	included(
		"Media Placeholder",
		"@platejs/media · media-placeholder-node · media-upload-toast",
		"Upload placeholder with progress; also used when files are dropped onto a block.",
	),
	included(
		"Mention",
		"@platejs/mention · mention-kit",
		"Type `@` (users from USERS).",
	),
	included(
		"Table",
		"@platejs/table · table-kit",
		"Toolbar Table (size picker, rows/columns, merge/split, borders, cell colour) or slash → Table; drag column edges to resize.",
	),
	included(
		"Table of Contents",
		"@platejs/toc · toc-kit",
		"Slash or Insert → Table of contents; click an entry to jump.",
	),
	included(
		"Toggle",
		"@platejs/toggle · toggle-kit",
		"Slash → Toggle or the toolbar ▸ button; indented blocks below fold into it.",
	),

	// Functionality
	included(
		"Combobox",
		"@platejs/combobox · inline-combobox",
		"Powers the `/`, `@`, `:` and `{{` menus.",
	),
	included(
		"Emoji",
		"@platejs/emoji · emoji-kit",
		"Type `:` + a name, toolbar Emoji picker, slash → Emoji.",
	),
	included(
		"Slash Command",
		"@platejs/slash-command · slash-kit",
		"Type `/` — every block, media, inline and template tool is listed.",
	),
	included(
		"Exit Break",
		"platejs · exit-break-kit",
		"⌘↵ leaves a code block, table or callout below; ⌘⇧↵ inserts above.",
	),
	included(
		"Forced Layout",
		"NormalizeTypesPlugin (platejs)",
		"Plate lab → Forced Layout: block 1 is always a Heading 1.",
	),
	included(
		"Single Block",
		"SingleBlockPlugin (platejs)",
		"Plate lab → Single Block: Enter adds a soft break, never a second block.",
	),
	included(
		"Single Line",
		"SingleLinePlugin + LengthPlugin (platejs)",
		"Plate lab → Single Line: no line breaks, capped at 60 characters.",
	),
	included(
		"Trailing Block",
		"TrailingBlockPlugin (platejs)",
		"There is always an empty paragraph after the last block.",
	),
	included(
		"Autoformat",
		"input rules · autoformat-kit",
		"Markdown while typing (**bold**, `code`, # heading, - / 1. / [] lists, > quote, ```, ---) and substitutions (->, (c), 1/2, smart quotes).",
	),
	included(
		"Block Menu",
		"@platejs/selection · block-menu-kit · block-context-menu",
		"Right-click a block: delete, duplicate, copy, insert below, turn into, indent, align, line height, text / background colour.",
	),
	included(
		"Block Placeholder",
		"BlockPlaceholderPlugin · block-placeholder-kit",
		"An empty focused block shows a hint.",
	),
	included(
		"Block Selection",
		"@platejs/selection · block-selection-kit",
		"Click left of a block or drag a rectangle from the margin, then right-click, Delete or ⌘C.",
	),
	included(
		"Caption",
		"@platejs/caption · caption",
		"Type under an image, video, audio or file.",
	),
	included(
		"Cursor Overlay",
		"@platejs/selection · cursor-overlay-kit",
		"The selection stays painted while a toolbar popover (link, colour) has focus.",
	),
	included(
		"Drag & Drop",
		"@platejs/dnd · dnd-kit · block-draggable",
		"Hover a block and drag the ⠿ handle; drop files to upload.",
	),
	included(
		"Find",
		"@platejs/find-replace · search-highlight-node",
		"Toolbar 🔍 Find & replace: highlights matches, Next jumps to each, Replace all (replace is our code; the plugin only highlights).",
	),
	included(
		"Multi Select",
		"@platejs/tag · select-editor · tag-node",
		"Plate lab → Multi Select: tag chips with fuzzy search and “create new”.",
	),
	included(
		"Navigation Feedback",
		"NavigationFeedbackPlugin (platejs core)",
		"Click a TOC entry or footnote, or Find → Next: the landed block flashes.",
	),
	included(
		"Tabbable",
		"@platejs/tabbable · tabbable-kit",
		"Tab in the middle of a paragraph moves focus into the next void's controls (caption, date…); at a block edge Tab still indents.",
	),
	included(
		"Fixed Toolbar",
		"fixed-toolbar-kit · fixed-toolbar-buttons",
		"Toolbar above the editor (undo, import/export, insert, turn into, fonts, marks, colours, align, lists, media, find, mode…).",
	),
	included(
		"Floating Toolbar",
		"floating-toolbar-kit · floating-toolbar-buttons",
		"Select text: turn into, marks, equation, link, highlight, comment, suggest.",
	),
	included(
		"Classic toolbars",
		"fixed-/floating-toolbar-classic-kit · insert/turn-into/list-classic buttons",
		"Plate lab → List Classic.",
	),

	// Marks
	included(
		"Basic Marks",
		"@platejs/basic-nodes · basic-marks-kit",
		"Fixed and floating toolbars, shortcuts and markdown input rules.",
	),
	included("Bold", "@platejs/basic-nodes", "⌘B, toolbar B, **text**."),
	included("Italic", "@platejs/basic-nodes", "⌘I, toolbar I, _text_."),
	included("Underline", "@platejs/basic-nodes", "⌘U, toolbar U."),
	included(
		"Strikethrough",
		"@platejs/basic-nodes",
		"⌘⇧X, toolbar S, ~~text~~.",
	),
	included("Code", "@platejs/basic-nodes", "⌘E, toolbar </>, `text`."),
	included(
		"Highlight",
		"@platejs/basic-nodes",
		"⌘⇧H, highlighter in both toolbars, ==text==.",
	),
	included(
		"Keyboard Input",
		"@platejs/basic-nodes · kbd-node",
		"Toolbar ⋯ More marks → Keyboard input.",
	),
	included("Subscript", "@platejs/basic-nodes", "⌘., More marks → Subscript."),
	included(
		"Superscript",
		"@platejs/basic-nodes",
		"⌘,, More marks → Superscript.",
	),

	// Styles
	included(
		"Font Color",
		"@platejs/basic-styles · font-color-toolbar-button",
		"Toolbar A (palette + custom colours), block menu → Text color.",
	),
	included(
		"Font Background Color",
		"@platejs/basic-styles",
		"Toolbar paint bucket, block menu → Background.",
	),
	included(
		"Font Size",
		"@platejs/basic-styles · font-size-toolbar-button",
		"Toolbar − 16 + (type or pick a size).",
	),
	included(
		"Font Family",
		"@platejs/basic-styles (our toolbar button)",
		"Toolbar font menu: Work Sans, Poppins, Montserrat, Anuphan first, then system fonts.",
	),
	included(
		"Font Weight",
		"@platejs/basic-styles (our toolbar button)",
		"Toolbar weight menu (300–800).",
	),
	included(
		"Indent",
		"@platejs/indent · indent-kit",
		"Toolbar outdent / indent, Tab / Shift+Tab, block menu.",
	),
	included(
		"Line Height",
		"@platejs/basic-styles · line-height-kit",
		"Toolbar line height, block menu → Line height.",
	),
	included(
		"List",
		"@platejs/list · list-kit",
		"Toolbar bulleted / numbered (with marker style menu), `- ` / `1. `; lists are indented paragraphs.",
	),
	included(
		"To-do List",
		"@platejs/list · list-kit",
		"Toolbar ☑, slash → To-do list, `[] `.",
	),
	included(
		"Text Align",
		"@platejs/basic-styles · align-kit",
		"Toolbar align (left, center, right, justify), block menu → Align.",
	),

	// Collaboration that works locally
	included(
		"Comment",
		"@platejs/comment · comment-kit",
		"Select text → Comment (fixed or floating toolbar); threads open beside the block.",
	),
	included(
		"Suggestion",
		"@platejs/suggestion · suggestion-kit",
		"Toolbar pen (Suggestion edits) or Mode → Suggestion, then edit; accept / reject in the thread.",
	),
	included(
		"Discussion",
		"discussion-kit · block-discussion · comment",
		"Comment and suggestion threads per block, local users only.",
	),
	excluded("Collaboration (Yjs)", "@platejs/yjs", COLLAB),
	excluded("Remote Cursor Overlay", "remote-cursor-overlay", COLLAB),

	// AI
	excluded(
		"AI",
		"@platejs/ai · ai-kit · ai-menu · ai-toolbar-button · ai-node · settings-dialog · use-chat",
		AI,
	),
	excluded("Copilot", "@platejs/ai · copilot-kit · ghost-text", AI),
	excluded(
		"Markdown Streaming",
		"markdown-joiner-transform · markdown-streaming-demo",
		"Helper for streaming LLM markdown into the editor; only useful with an AI backend (Q14).",
	),

	// Serializing
	included(
		"HTML",
		"platejs/static serializeHtml + HtmlPlugin",
		"HTML tab; Export → Export as HTML; Import → Import from HTML; paste HTML.",
	),
	included(
		"Markdown",
		"@platejs/markdown · markdown-kit (remark-gfm, remark-math, remark-emoji, MDX)",
		"Markdown tab, Import MD / Export MD / Round-trip, toolbar Import / Export → Markdown, paste markdown.",
	),
	included(
		"Serializing CSV",
		"@platejs/csv",
		"Paste comma-separated text with a header row → a table.",
	),
	included(
		"DOCX Paste",
		"@platejs/docx · @platejs/juice · docx-kit",
		"Paste from Word / Google Docs: mso lists become lists, Word styles are cleaned.",
	),
	included(
		"DOCX Import/Export",
		"@platejs/docx-io · docx-export-kit",
		"Toolbar Import → Import from Word; Export → Export as Word (loaded on click).",
	),
	included(
		"Export to PDF / Image",
		"export-toolbar-button · html2canvas-pro · pdf-lib",
		"Toolbar Export → Export as PDF / Export as Image.",
	),

	// Core and guides with a user-facing feature
	included(
		"Static Rendering",
		"PlateStatic · editor-static · BaseEditorKit",
		"Rendered tab: read-only render from the JSON, no editor instance.",
	),
	included(
		"Read-only mode",
		"mode-toolbar-button",
		"Toolbar mode menu → Viewing.",
	),
	included(
		"History (undo / redo)",
		"HistoryPlugin (platejs core) · history-toolbar-button",
		"Toolbar ↶ ↷, ⌘Z / ⌘⇧Z.",
	),
	included(
		"Unique ID",
		"NodeIdPlugin (platejs core)",
		"Every block gets an `id` (JSON tab); comments, DnD and diffs rely on it.",
	),
	included(
		"Plugin Rules",
		"rules.break / delete / merge / selection (platejs)",
		"Enter on an empty heading resets it; Shift+Enter soft break; Backspace rules. Replaces the v48 Reset Node, Soft Break and Select on Backspace plugins.",
	),
	included(
		"Affinity",
		"AffinityPlugin (platejs core) · rules.selection",
		"Arrow past the edge of inline code (hard) or a link (directional) to type outside it.",
	),
	included(
		"Plugin Shortcuts",
		"plugin shortcuts",
		"⌘B/I/U/E, ⌘⇧X, ⌘⇧H, ⌘⌥1–6 headings, ⌘⇧. quote, ⌘K link.",
	),
	included(
		"Controlled Editor Value",
		"editor.tf.setValue / remount",
		"Reset, Import MD and Round-trip replace the document.",
	),
	included(
		"Version History",
		"@platejs/diff (registry example)",
		"Showcase → Version history: Save version, edit, Compare v1 with now.",
	),
	included(
		"Preview Markdown",
		"decorate + prismjs (registry example)",
		"Plate lab → Preview Markdown.",
	),
	included(
		"Editable Voids",
		"createPlatePlugin isVoid (docs example)",
		"Plate lab → Editable Voids: inputs and a nested editor inside a void.",
	),
	included(
		"Editor Kit",
		"registry editor-kit",
		"The main editor is editor-kit minus AI/Copilot, plus find, CSV, tabbable, font weight and our variable chip.",
	),
	excluded(
		"Media upload via UploadThing",
		"media-uploadthing-kit · uploadthing",
		"Needs an UploadThing account token (vendor cloud). Uploads become base64 data URLs instead (ADR-0004).",
	),
	excluded(
		"Plate Plus",
		"platejs.org/plus",
		"Paid templates and premium components (ADR-0005).",
	),
	excluded(
		"Server-side rendering of the editor (RSC / SSR)",
		"platejs/static on the server",
		"ADR-0001 keeps editors client-only; the SSR build stubs the editor out, so PlateStatic only runs in the browser here.",
	),
	excluded(
		"Chunking / Huge Document / Hundreds Editors",
		"ChunkingPlugin (platejs core) · examples",
		"Performance switches and benchmarks for 10k+ block documents; nothing to try in a one-page sample.",
	),
	excluded(
		"Form",
		"react-hook-form guide",
		"Integration guide; this page has no form to bind (would add react-hook-form + zod).",
	),
	excluded("Debugging", "DebugPlugin (platejs core)", DEV),
	excluded("Playwright Testing", "@platejs/playwright", DEV),
	excluded("Unit Testing", "@platejs/test-utils", DEV),
	excluded(
		"Localization (i18n)",
		"—",
		"Plate has no i18n layer; UI strings are hard-coded in the copied registry components.",
	),
];

export const meta: EditorMeta = {
	id: "plate",
	name: "Plate",
	tagline:
		"Slate-based plugin framework (MIT) with a shadcn-style copy-in UI registry — the biggest free feature set of the four.",
	homepage: "https://platejs.org",
	packages: [
		"platejs",
		"@platejs/basic-nodes",
		"@platejs/basic-styles",
		"@platejs/callout",
		"@platejs/caption",
		"@platejs/code-block",
		"@platejs/code-drawing",
		"@platejs/combobox",
		"@platejs/comment",
		"@platejs/csv",
		"@platejs/date",
		"@platejs/diff",
		"@platejs/dnd",
		"@platejs/docx",
		"@platejs/docx-io",
		"@platejs/emoji",
		"@platejs/excalidraw",
		"@platejs/find-replace",
		"@platejs/floating",
		"@platejs/footnote",
		"@platejs/indent",
		"@platejs/juice",
		"@platejs/layout",
		"@platejs/link",
		"@platejs/list",
		"@platejs/list-classic",
		"@platejs/markdown",
		"@platejs/math",
		"@platejs/media",
		"@platejs/mention",
		"@platejs/resizable",
		"@platejs/selection",
		"@platejs/slash-command",
		"@platejs/suggestion",
		"@platejs/tabbable",
		"@platejs/table",
		"@platejs/tag",
		"@platejs/toc",
		"@platejs/toggle",
		"@excalidraw/excalidraw",
		"@ariakit/react",
		"@udecode/cmdk",
		"cmdk",
		"fzf",
		"prismjs",
		"react-dnd",
		"react-dnd-html5-backend",
		"remark-gfm",
		"remark-math",
		"remark-emoji",
		"@emoji-mart/data",
		"lowlight",
		"katex",
		"html2canvas-pro",
		"pdf-lib",
		"lodash",
		"use-file-picker",
		"react-day-picker",
		"react-player",
		"react-lite-youtube-embed",
		"react-tweet",
		"radix-ui",
	],
	uiApproach:
		"Official Plate UI registry (`shadcn add @plate/plate-ui` + kits) vendored into src/editors/plate/{ui,components,hooks,lib} and composed into our own EditorKit without AIKit/CopilotKit. We edited the vendored files: AI buttons/menus removed, uploadthing replaced by base64 data URLs, mention combobox fed from USERS, every insertable tool added to the slash menu / Insert / block menu, Word import/export lazy-loaded, toolbar buttons labelled from their tooltips. Our own code: the {{variable}} chip and its markdown rules, font family/weight and find & replace buttons, the Plate lab (single-purpose editors) and version history.",
	features: {
		marks: {
			status: "kit",
			note: "Bold/italic/underline/strike/code/highlight/kbd/sub/sup + font colour, background, size, family (BML fonts first) and weight.",
		},
		headings: { status: "kit", note: "H1–H6." },
		lists: {
			status: "kit",
			note: "Plate lists are indent-based paragraphs (`listStyleType` + `indent`); classic nested ul/li lists (@platejs/list-classic) are in the Plate lab.",
		},
		"task-list": { status: "kit" },
		link: {
			status: "kit",
			note: "Floating link toolbar, ⌘K, autolink on paste.",
		},
		blockquote: { status: "kit" },
		"code-block": {
			status: "kit",
			note: "lowlight syntax highlighting with language picker.",
		},
		table: {
			status: "kit",
			note: "Cell selection, merge, column resize, row/column menus; CSV paste makes a table.",
		},
		image: {
			status: "custom",
			note: "Registry media kit (resize, caption, preview); its uploadthing hook was replaced with fileToDataUrl — >1 MB shows a toast and removes the placeholder.",
		},
		"undo-redo": { status: "builtin" },
		"slash-menu": {
			status: "kit",
			note: "Lists every insertable tool (35 items).",
		},
		"drag-handle": {
			status: "kit",
			note: "@platejs/dnd + react-dnd; also drops into columns and drops files.",
		},
		"floating-toolbar": { status: "kit" },
		"fixed-toolbar": { status: "kit" },
		"markdown-shortcuts": {
			status: "kit",
			note: "Autoformat kit: #, -, 1., [], >, ```, ---, **bold**, `code`, smart quotes, arrows.",
		},
		mention: {
			status: "kit",
			note: "Registry mention combobox fed from USERS; markdown rule replaced so labels keep `[@Label](mention:id)` exactly.",
		},
		variable: {
			status: "custom",
			note: "Our inline-void plugin (createSlatePlugin + toPlatePlugin), `{{` trigger via an insertText override, picker built on the registry InlineCombobox, slash item, static node, remark plugin + MdRules.",
		},
		"markdown-import": {
			status: "builtin",
			note: "@platejs/markdown (remark + MDX). `{{x}}` on its own line becomes an MDX flow expression → its own paragraph.",
		},
		"markdown-export": {
			status: "partial",
			note: "Idempotent round-trip on the sample, but toggle, code drawing and excalidraw blocks (and indentation of plain paragraphs) are silently dropped; Plate-only blocks export as MDX tags (<callout>, <column_group>, <toc />, <date />); font colour/family/weight export as inline <span style>.",
		},
		"html-export": {
			status: "builtin",
			note: "serializeHtml from platejs/static with the static kit (async, renders React to a string). Word export (.docx) too.",
		},
		"static-render": {
			status: "builtin",
			note: "<PlateStatic> (EditorStatic) with the base kit — no editor instance or DOM selection.",
		},
		ssr: {
			status: "partial",
			note: 'Editor is client-only; the route\'s lazy imports return a stub when import.meta.env.SSR, so the worker bundle carries no Plate code. @platejs/docx-io needed a Vite resolve plugin (htmlparser2@3 `require("../")`) to run in dev and build.',
		},
		"thai-ime": {
			status: "partial",
			note: "manual check — Playwright keyboard.type of Thai works, but that is not a real IME composition.",
		},
	},
	showcase: [
		"Block selection: click beside blocks or drag a selection rectangle, then right-click for the block menu (turn into, colours, line height, align, duplicate, copy…).",
		"Comments and suggestions (local only): select text → comment, or switch to Suggestion mode to track insertions/deletions with accept/reject.",
		"Columns, toggles, callouts and an auto-updating table of contents that flashes the target on click (“Insert showcase blocks” below adds them).",
		"Word round-trip: Import from Word / Export as Word (@platejs/docx-io), paste from Word (@platejs/docx), paste CSV as a table.",
		"Find & replace with highlights, font family with the Boonmee Lab fonts, version history with a visual diff (@platejs/diff).",
		"Math (KaTeX), dates, footnotes, emoji, Excalidraw and code drawings (Mermaid / PlantUML / Graphviz) as blocks; export to HTML / PDF / PNG / Markdown.",
		"Plate lab: classic nested lists, tag multi-select, single-line and single-block fields, forced layout, markdown preview decorations, editable voids.",
	],
	findings: [
		"The registry is a lot of code: ~210 vendored files; `editor-kit` pulls AI (@platejs/ai), Copilot and uploadthing by default — we deleted the AI UI, edited the kits that referenced AIChatPlugin, and rewrote use-upload-file.",
		'@platejs/docx-io works after one Vite fix: html-to-vdom → htmlparser2@3, whose lib/Stream.js does `require("../")`, which Rolldown (Vite 8 optimizer and build) cannot resolve. A 10-line resolve plugin in vite.config.ts (client + workerd SSR optimizers + build) maps it to lib/index.js. It is imported on click (1.4 MB / 371 KB gzip chunk).',
		"Export as Word then crashed in the browser build of juice: React escapes quotes inside style attributes (`&#x27;`, `&quot;`) and juice splits declarations on the entity's `;`. Unquoting font-family values (registry static components + our font menu + the exported value) fixed it.",
		'Paste parsers run last-plugin-first: CsvPlugin must sit after MarkdownKit or the markdown text/plain parser swallows CSV. A paste becomes a table only when every line has the same number (≥2) of comma-separated fields, so two short lines like "a, b\\nc, d" turn into a table while ordinary prose stays text.',
		"@platejs/find-replace only highlights, and only in blocks whose children are all text (paragraphs with a chip, mention or link get no highlight); replace is app code (ours, unit-tested).",
		"Gaps between docs and registry: FontWeightPlugin is documented but missing from font-kit, there is no font-family/weight button, the tabbable kit switches IndentPlugin off (we kept indent), the floating colour dropdowns close the floating toolbar (kept in the fixed toolbar), and toolbar buttons have no accessible names (we label them from the tooltip; the More button was labelled “Insert”).",
		"Indent lists and classic lists cannot share an editor (both claim `- `/`1. ` autoformat and list paste/markdown), so classic lists live in a separate lab editor with the registry's classic toolbars.",
		"Markdown is good but not lossless for Plate-only blocks: toggle, code_drawing and excalidraw have no MdRules and are dropped with a console.warn('Unreachable code'); combobox input/placeholder nodes too, so we strip them before serializing.",
		"MDX is on by default in the markdown kit, so `{{name}}` parses as an mdxTextExpression (handled in our remark plugin) and soft line breaks export as hard breaks (`\\`). After one export the markdown is stable (round-trip lossless on the sample).",
		"Plate's built-in mention markdown uses the link text as the label including the `@`, and remarkMention also turns any bare `@word` into a mention — replaced with our own remark plugin + rules.",
		"Empty table cells export as a zero-width space (U+200B); tables export with `| - |` delimiter rows (we disabled pipe alignment).",
		"Bundle (vite build): plate-editor chunk 1.46 MB / 469 KB gzip + snapshot (static kit) 2.17 MB / 657 KB gzip + 180 KB CSS, plus lazy docx-io (371 KB gzip), lab (22 KB gzip), excalidraw and mermaid chunks. With the import.meta.env.SSR stub the server build dropped from 56 MB to 22 MB raw (13.0 → 4.7 MB gzipped tar, all four editors' worker code at this commit).",
		"serializeHtml is async and renders the whole static tree through React; we run it on a 120 ms debounce on a separate headless editor. The HTML carries all Tailwind classes and data-slate-* attributes (~40 KB for the sample).",
		"In Chrome, Slate handles rich paste from `beforeinput` (insertFromPaste) and plain text from `paste`, so e2e paste fixtures must dispatch the matching event.",
		"Vitest: @platejs/math imports katex.min.css from its dist, which Node cannot load when vitest externalizes the package — our markdown unit test mocks @platejs/math.",
		"Types: one registry TS error out of the box (date-node `initialFocus` → `autoFocus` for react-day-picker 10); otherwise strict TS 6 + React 19 clean.",
	],
	inventory,
};
