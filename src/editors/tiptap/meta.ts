import type { EditorMeta, ToolEntry } from "@/editors/types";

const PAID = "Requires a paid Tiptap account";
const AI =
	"AI feature: needs an LLM / Tiptap AI endpoint (out of scope, ADR-0005)";
const COLLAB =
	"Real-time collaboration: needs a Yjs sync provider (Hocuspocus / Tiptap Cloud) — out of scope, ADR-0005";

const inc = (name: string, source: string, howTo: string): ToolEntry => ({
	name,
	source,
	status: "included",
	howTo,
});
const exc = (name: string, reason: string, source?: string): ToolEntry => ({
	name,
	source,
	status: "excluded",
	reason,
});

/**
 * Every extension on tiptap.dev/docs/editor/extensions (nodes, marks, functionality),
 * the public @tiptap/* packages not listed there, and the editor-level APIs.
 */
const inventory: ToolEntry[] = [
	// Nodes
	inc(
		"Audio",
		"@tiptap/extension-audio",
		"Slash / Insert → Audio (URL) or Audio file (base64, ≤ 1 MB); pasting an .mp3 link also embeds it",
	),
	inc(
		"Blockquote",
		"@tiptap/starter-kit",
		"Block-type menu → Quote, slash → Quote, or type > ",
	),
	inc(
		"BulletList",
		"@tiptap/extension-list (ListKit)",
		"Toolbar bullet list, ⌘⇧8, or type - ",
	),
	inc(
		"CodeBlock",
		"@tiptap/extension-code-block",
		"Extended by CodeBlockLowlight below; type ``` or slash → Code block",
	),
	inc(
		"CodeBlock Lowlight",
		"@tiptap/extension-code-block-lowlight",
		"Inside a code block the toolbar shows a language picker (lowlight common set)",
	),
	inc(
		"Details",
		"@tiptap/extension-details",
		"Slash / Insert → Toggle; click the ▸ to open or close",
	),
	inc(
		"DetailsSummary",
		"@tiptap/extension-details",
		"The first line of a Toggle block",
	),
	inc(
		"DetailsContent",
		"@tiptap/extension-details",
		"The body of a Toggle block",
	),
	inc("Document", "@tiptap/starter-kit", "Always on (top-level node)"),
	inc(
		"Emoji",
		"@tiptap/extension-emoji",
		"Type : then a shortcode (:smile), or emoticons like :) ; slash → Emoji",
	),
	inc(
		"Hard break",
		"@tiptap/starter-kit",
		"Shift+Enter, or slash / Insert → Line break",
	),
	inc(
		"Heading",
		"@tiptap/starter-kit",
		"Block-type menu (H1–H6), slash → Heading 1–6, or type # … ######",
	),
	inc(
		"Horizontal Rule",
		"@tiptap/starter-kit",
		"Slash / Insert → Divider, or type ---",
	),
	inc(
		"Image",
		"@tiptap/extension-image",
		"Toolbar image button, paste or drop a file; click an image → resize corners + image menu (alt, caption, S/M/L/Auto)",
	),
	inc(
		"List Item",
		"@tiptap/extension-list (ListKit)",
		"Items of bullet / numbered lists; Tab / ⇧Tab or toolbar indent / outdent",
	),
	inc(
		"Mathematics",
		"@tiptap/extension-mathematics",
		"Slash / Insert → Inline math, Block math, Convert $…$ text to math; click a formula to edit",
	),
	inc(
		"Mention",
		"@tiptap/extension-mention",
		"Type @ (people from the users list); slash → Mention",
	),
	inc(
		"Ordered List",
		"@tiptap/extension-list (ListKit)",
		"Toolbar numbered list (⌘⇧7) + ▾ numbering style (1, a, A, i, I), or type 1. ",
	),
	inc(
		"Paragraph",
		"@tiptap/starter-kit",
		"Default block; block-type menu → Text",
	),
	inc(
		"Table",
		"@tiptap/extension-table (TableKit)",
		"Toolbar table menu → Insert 3 × 3; drag column borders to resize",
	),
	inc(
		"Table Row",
		"@tiptap/extension-table (TableKit)",
		"Table menu → add / delete row",
	),
	inc(
		"Table Header",
		"@tiptap/extension-table (TableKit)",
		"Table menu → toggle header row / column / cell",
	),
	inc(
		"Table Cell",
		"@tiptap/extension-table (TableKit)",
		"Table menu → merge / split cells, next / previous cell",
	),
	inc(
		"Task Item",
		"@tiptap/extension-list (ListKit)",
		"Checkbox items (nested allowed), type [ ] ",
	),
	inc(
		"Task List",
		"@tiptap/extension-list (ListKit)",
		"Toolbar task list (⌘⇧9) or slash → Task list",
	),
	inc("Text", "@tiptap/starter-kit", "Always on"),
	inc(
		"Twitch",
		"@tiptap/extension-twitch",
		"Slash / Insert → Twitch (video, clip or channel URL); `parent` is set to this host",
	),
	inc(
		"Youtube",
		"@tiptap/extension-youtube",
		"Slash / Insert → YouTube (nocookie embed)",
	),
	// Marks
	inc("Bold", "@tiptap/starter-kit", "Toolbar / bubble B, ⌘B, or **text**"),
	inc("Code", "@tiptap/starter-kit", "Toolbar / bubble <>, ⌘E, or `text`"),
	inc(
		"Highlight",
		"@tiptap/extension-highlight",
		"Colour menu → Highlight (multicolour), ⌘⇧H, or ==text==",
	),
	inc("Italic", "@tiptap/starter-kit", "Toolbar / bubble I, ⌘I, or *text*"),
	inc(
		"Link",
		"@tiptap/starter-kit",
		"Toolbar / bubble link popover or ⌘K (edit, open, remove); URLs autolink while typing",
	),
	inc(
		"Ruby Text",
		"@tiptap/extension-ruby-text",
		"Select text → toolbar / bubble 文A button; click the annotation to edit it in place",
	),
	inc("Strike", "@tiptap/starter-kit", "Toolbar / bubble S, ⌘⇧S, or ~~text~~"),
	inc("Subscript", "@tiptap/extension-subscript", "Toolbar x₂, ⌘,"),
	inc("Superscript", "@tiptap/extension-superscript", "Toolbar x², ⌘."),
	inc(
		"Text Style",
		"@tiptap/extension-text-style",
		"Carrier mark for colour, background, font family, size and line height",
	),
	inc("Underline", "@tiptap/starter-kit", "Toolbar / bubble U, ⌘U"),
	// Functionality
	exc("Basic AI Generation", `${AI}; also ${PAID.toLowerCase()} (Start plan)`),
	exc("AI Toolkit", AI, "@tiptap/ai-toolkit"),
	inc(
		"Background Color",
		"@tiptap/extension-text-style (TextStyleKit)",
		"Colour menu → Background (presets or any colour)",
	),
	inc(
		"Bubble Menu",
		"@tiptap/react/menus",
		"Select text → floating toolbar; select an image → image menu",
	),
	inc(
		"Character Count",
		"@tiptap/extensions",
		"Status bar under the editor (words / characters)",
	),
	exc("Collaboration Caret", COLLAB, "@tiptap/extension-collaboration-caret"),
	exc("Collaboration", COLLAB, "@tiptap/extension-collaboration"),
	inc(
		"Color",
		"@tiptap/extension-text-style (TextStyleKit)",
		"Colour menu → Text colour (presets or any colour)",
	),
	exc(
		"Comments",
		`${PAID} (Start plan: private registry + Tiptap Cloud comments)`,
	),
	inc(
		"Drag Handle React",
		"@tiptap/extension-drag-handle-react",
		"Hover a block → ⋮⋮ grip on the left; drag to reorder (nested blocks too)",
	),
	exc(
		"Drag Handle Vue",
		"Vue binding; this page is React and uses Drag Handle React",
		"@tiptap/extension-drag-handle-vue",
	),
	inc(
		"Drag Handle",
		"@tiptap/extension-drag-handle",
		"Plugin behind the React grip (nested mode on); Settings → Lock drag handle",
	),
	inc(
		"Dropcursor",
		"@tiptap/starter-kit",
		"Drag a block or file: a magenta drop line shows where it lands",
	),
	exc(
		"Export",
		`${PAID} (Start plan): DOCX/ODT/PDF/EPUB export runs on the Tiptap Conversion cloud service`,
	),
	inc(
		"File Handler",
		"@tiptap/extension-file-handler",
		"Paste or drop png / jpeg / gif / webp files (inlined, ≤ 1 MB)",
	),
	inc(
		"Find and Replace",
		"@tiptap/extension-find-and-replace",
		"Toolbar 🔍 or ⌘F: case / whole word / regex, previous / next, replace, replace all",
	),
	inc(
		"Floating Menu",
		"@tiptap/react/menus",
		"Click an empty line → quick-insert bar (/, H1, H2, lists, quote, table, image, variable)",
	),
	inc(
		"Focus",
		"@tiptap/extensions",
		"Settings → Focus mode (dims every block except the one with the caret)",
	),
	inc(
		"Font Family",
		"@tiptap/extension-text-style (TextStyleKit)",
		"Toolbar font menu (Work Sans, Poppins, Montserrat, Anuphan first)",
	),
	inc(
		"Font Size",
		"@tiptap/extension-text-style (TextStyleKit)",
		"Toolbar size menu (12–36 px)",
	),
	inc(
		"Gapcursor",
		"@tiptap/starter-kit",
		"Arrow keys next to a table, image, embed or math block place a horizontal caret",
	),
	exc(
		"Import",
		`${PAID} (Start plan): DOCX/ODT import runs on the Tiptap Conversion cloud service`,
	),
	inc(
		"Invisible Characters",
		"@tiptap/extension-invisible-characters",
		"Settings → Invisible characters (spaces, breaks, paragraph ends)",
	),
	inc(
		"Line Height",
		"@tiptap/extension-text-style (TextStyleKit)",
		"Toolbar line-height menu",
	),
	inc(
		"ListKit",
		"@tiptap/extension-list",
		"Bundles the list nodes + List Keymap used by the list buttons",
	),
	inc(
		"List Keymap",
		"@tiptap/extension-list (ListKit)",
		"Backspace / Delete at item edges join or lift list items",
	),
	exc("Pages", `${PAID} (Team plan)`),
	exc("Paste Handler", `${PAID} (Team plan)`),
	inc(
		"Placeholder",
		"@tiptap/extensions",
		"Empty line hint: “Type / for blocks…”",
	),
	inc(
		"Selection",
		"@tiptap/extensions",
		"Select text, then open a toolbar popover: the selection stays highlighted",
	),
	exc(
		"Compare Snapshots",
		`${PAID} (Team plan) and needs Tiptap Collaboration history`,
	),
	exc(
		"Snapshot",
		`${PAID} (document history lives in Tiptap Collaboration cloud)`,
	),
	inc(
		"StarterKit",
		"@tiptap/starter-kit",
		"Base nodes, marks, history, drop / gap cursor, trailing node (lists replaced by ListKit, code block by Lowlight)",
	),
	inc(
		"TableKit",
		"@tiptap/extension-table",
		"Toolbar table menu (16 table commands)",
	),
	inc(
		"Table of contents",
		"@tiptap/extension-table-of-contents",
		"Outline panel below the editor (click to scroll)",
	),
	inc(
		"TextStyleKit",
		"@tiptap/extension-text-style",
		"Colour, background, font family, size, line height",
	),
	inc(
		"Text Align",
		"@tiptap/extension-text-align",
		"Toolbar alignment menu (left, center, right, justify, reset); ⌘⇧L/E/R/J",
	),
	exc("Tracked Changes", `${PAID} (add-on, alpha, private registry)`),
	inc(
		"Trailing Node",
		"@tiptap/starter-kit",
		"An empty paragraph is kept after a final table / code block so you can keep typing",
	),
	inc(
		"Typography",
		"@tiptap/extension-typography",
		'Type -- → —, (c) → ©, 1/2 → ½, "quotes" → “quotes”',
	),
	inc("Undo/Redo", "@tiptap/starter-kit", "Toolbar ↶ ↷, ⌘Z / ⌘⇧Z"),
	inc(
		"UniqueID",
		"@tiptap/extension-unique-id",
		"Every block gets data-uid (see HTML / JSON tabs); Settings → Block IDs shows them",
	),
	// Public @tiptap packages that the extensions overview does not list
	inc(
		"Node Range",
		"@tiptap/extension-node-range",
		"⌘-drag, Shift+↑/↓ or ⌘A select whole blocks; the drag handle moves the range",
	),
	exc(
		"Vue 3 / Vue 2 bindings",
		"Vue; this page uses @tiptap/react",
		"@tiptap/vue-3",
	),
	// Editor API (tiptap.dev/docs/editor/api + core concepts)
	inc(
		"React bindings (useEditor, useEditorState, EditorContent)",
		"@tiptap/react",
		"The whole page; toolbars re-render via useEditorState selectors",
	),
	inc(
		"Commands (chain, can, focus, setMeta…)",
		"@tiptap/core",
		"Every button; Undo / Redo / indent are disabled through can()",
	),
	inc(
		"Keyboard shortcuts",
		"@tiptap/core",
		"Built-in mark / block shortcuts plus our addKeyboardShortcuts: ⌘K link, ⌘F find",
	),
	inc(
		"Input rules",
		"@tiptap/core",
		"Markdown shortcuts while typing, plus our {{name}} → variable chip rule",
	),
	inc(
		"Paste rules",
		"@tiptap/core",
		"Paste {{name}} → chip; paste a YouTube / Twitch / audio URL → embed",
	),
	inc(
		"Events (editor.on)",
		"@tiptap/core",
		"Editor events panel counts create, update, selectionUpdate, transaction, focus, blur, paste, drop, delete, contentError",
	),
	inc(
		"Content check (enableContentCheck)",
		"@tiptap/core",
		"Stored JSON that does not fit the schema raises contentError (toast) instead of crashing",
	),
	inc("Editable (setEditable)", "@tiptap/core", "Settings → Read-only"),
	inc(
		"Node views (ReactNodeViewRenderer)",
		"@tiptap/react",
		"{{variable}} chips are React node views",
	),
	inc("Mark views", "@tiptap/core", "Ruby Text renders through a mark view"),
	inc(
		"Resizable node views",
		"@tiptap/core (ResizableNodeView)",
		"Image corner handles (Image `resize` option)",
	),
	inc(
		"Decorations API (addDecorations)",
		"@tiptap/core",
		"Settings → Block IDs: node decorations rebuilt with updateDecorations()",
	),
	inc(
		"Node positions (NodePos)",
		"@tiptap/core",
		"Status bar heading / image counts use editor.$nodes()",
	),
	inc(
		"JSX renderHTML",
		"@tiptap/core/jsx-runtime",
		"Image renderHTML (figure + figcaption) is written in Tiptap JSX — see HTML tab",
	),
	inc(
		"HTML utility (generateJSON / generateHTML)",
		"@tiptap/core",
		"Slash / Insert → Insert HTML (generateJSON with this schema); @tiptap/html is only the server build",
	),
	inc(
		"Suggestion utility",
		"@tiptap/suggestion",
		"Four triggers: / blocks, @ people, {{ variables, : emoji",
	),
	inc(
		"Markdown",
		"@tiptap/markdown",
		"Import MD / Export MD / Round-trip, Markdown tab, slash → Insert markdown",
	),
	inc(
		"Static renderer",
		"@tiptap/static-renderer",
		"Preview → Rendered tab (JSON → React, no editor instance)",
	),
	inc(
		"Custom extensions (Node.create / extend)",
		"@tiptap/core",
		"Variable chip node, Mention / Image / Highlight / TextStyle extended for markdown",
	),
	inc(
		"Persistence",
		"@tiptap/core (getJSON)",
		"Edits are saved as JSON in localStorage; Reset clears them",
	),
	exc(
		"Text direction (textDirection / setTextDirection)",
		"Needs the editor-wide textDirection option, which adds a dir attribute to every node — that changes the shared variable / mention HTML form (ADR-0002); Thai and English are both LTR",
		"@tiptap/core",
	),
	exc(
		"Tiptap for PHP",
		"PHP library; this app is TypeScript",
		"ueberdosis/tiptap-php",
	),
	// Tiptap UI Components (separate product, copied in with the Tiptap CLI)
	exc(
		"Tiptap UI Components (free: mark / heading / list / link / align / undo / colour-highlight / image-upload buttons, search-and-replace, Simple Editor template)",
		"Project decision: this page's UI is hand-built on the app's shadcn components and every free component has an equivalent here; the Tiptap set is SCSS-themed and would duplicate it",
		"@tiptap/cli",
	),
	exc(
		"Tiptap UI Components (Start plan: slash / mention / emoji dropdowns, drag context menu, turn-into, font-family combobox, image / table / TOC node UIs)",
		`${PAID} (Start plan); built here by hand instead`,
	),
	exc("Notion-like editor template", `${PAID} (Start plan)`),
	exc("DOCX editor template", `${PAID} (Team plan)`),
];

export const meta: EditorMeta = {
	id: "tiptap",
	name: "Tiptap",
	tagline:
		"Headless ProseMirror framework (v3.31, MIT core) — every pixel of UI on this page is ours, built from the app's shadcn components.",
	homepage: "https://tiptap.dev",
	packages: [
		"@tiptap/react",
		"@tiptap/core",
		"@tiptap/pm",
		"@tiptap/starter-kit",
		"@tiptap/extensions",
		"@tiptap/extension-list",
		"@tiptap/markdown",
		"@tiptap/static-renderer",
		"@tiptap/suggestion",
		"@tiptap/extension-mention",
		"@tiptap/extension-drag-handle-react",
		"@tiptap/extension-node-range",
		"@tiptap/extension-code-block-lowlight",
		"@tiptap/extension-table",
		"@tiptap/extension-image",
		"@tiptap/extension-file-handler",
		"@tiptap/extension-text-align",
		"@tiptap/extension-text-style",
		"@tiptap/extension-highlight",
		"@tiptap/extension-subscript",
		"@tiptap/extension-superscript",
		"@tiptap/extension-ruby-text",
		"@tiptap/extension-typography",
		"@tiptap/extension-details",
		"@tiptap/extension-mathematics",
		"@tiptap/extension-emoji",
		"@tiptap/extension-youtube",
		"@tiptap/extension-twitch",
		"@tiptap/extension-audio",
		"@tiptap/extension-table-of-contents",
		"@tiptap/extension-find-and-replace",
		"@tiptap/extension-invisible-characters",
		"@tiptap/extension-unique-id",
		"lowlight",
		"katex",
		"marked",
	],
	uiApproach:
		"Hand-built. Tiptap ships no UI in its MIT packages; the official 'Tiptap UI Components' are SCSS-based and the slash / drag / mention dropdown UIs need the paid Start plan. Fixed toolbar, BubbleMenu (text + image), FloatingMenu, link / find & replace popovers, colour / font / size / line-height / table / numbering / code-language / settings menus, one prompt dialog and the slash / @ / {{ / : popups are our own React components on src/components/ui (Toggle, DropdownMenu, Popover, Command, Tooltip, Dialog) + lucide icons, styled with BML tokens in tiptap.css.",
	features: {
		marks: {
			status: "builtin",
			note: "StarterKit (bold, italic, underline, strike, code) + Subscript / Superscript / Highlight / Ruby Text / TextStyleKit (colour, background, font family, size, line height); toolbar is ours. Marks without markdown syntax are exported as inline HTML.",
		},
		headings: {
			status: "builtin",
			note: "StarterKit Heading, H1–H6; dropdown is ours.",
		},
		lists: {
			status: "builtin",
			note: "ListKit from @tiptap/extension-list (bullet, ordered with 1/a/A/i/I numbering, list keymap); indent / outdent buttons are ours.",
		},
		"task-list": {
			status: "builtin",
			note: "ListKit TaskList + TaskItem (nested), markdown `- [x]` round-trips.",
		},
		link: {
			status: "builtin",
			note: "Link is in StarterKit v3 (autolink on); the edit popover and ⌘K shortcut are ours.",
		},
		blockquote: { status: "builtin" },
		"code-block": {
			status: "builtin",
			note: "CodeBlockLowlight + lowlight `common`; language picker and token colours are ours. The static renderer does not run decorations, so Rendered re-highlights with lowlight in a nodeMapping.",
		},
		table: {
			status: "builtin",
			note: "TableKit (resizable columns, merge/split, header row/column/cell); insert/edit menu is ours. Markdown export re-pads table columns.",
		},
		image: {
			status: "builtin",
			note: "Image (allowBase64, v3 `resize` corner handles) + FileHandler for paste/drop; picker, fileToDataUrl, the >1 MB toast, the caption (= title) and the image BubbleMenu are ours. Resized images are exported to markdown as <img width height>.",
		},
		"undo-redo": { status: "builtin", note: "UndoRedo in StarterKit." },
		"slash-menu": {
			status: "custom",
			note: "@tiptap/suggestion (char '/') + our Command-styled popup (30 items), positioned by Suggestion's built-in floating-ui `mount()`. Official slash UI is paid.",
		},
		"drag-handle": {
			status: "builtin",
			note: "@tiptap/extension-drag-handle-react (MIT), nested mode on. It statically imports @tiptap/extension-collaboration + @tiptap/y-tiptap (yjs) even without collaboration.",
		},
		"floating-toolbar": {
			status: "builtin",
			note: "Official BubbleMenu (text selection + a second one for images) and FloatingMenu on empty lines from @tiptap/react/menus; the buttons inside are ours.",
		},
		"fixed-toolbar": {
			status: "custom",
			note: "No free toolbar exists; built from shadcn Toggle / DropdownMenu / Popover with useEditorState.",
		},
		"markdown-shortcuts": {
			status: "builtin",
			note: "Input rules for #, -, 1., [ ], >, ```, **bold**, ==highlight== etc. Plus our own `{{name}}` input/paste rule and Typography auto-replace.",
		},
		mention: {
			status: "custom",
			note: 'Official Mention node + our popup; we overrode its markdown (default is `[@ id="u1" label="…"]`) and HTML attributes (default adds data-label / data-mention-suggestion-char) to match the shared forms.',
		},
		variable: {
			status: "custom",
			note: "Node.create (inline atom) + ReactNodeViewRenderer chip; a second Suggestion plugin with char '{{', a slash item, a FloatingMenu button and a `{{name}}` input rule.",
		},
		"markdown-import": {
			status: "builtin",
			note: "@tiptap/markdown (marked) with our markdownTokenizer/parseMarkdown for {{var}} and [@Label](mention:id). Inline HTML (<sub>, <span style>, <ruby>, <img width>) is parsed back through the schema. Marks around an atom are dropped upstream; we handle the `**{{x}}**` case ourselves.",
		},
		"markdown-export": {
			status: "builtin",
			note: "editor.getMarkdown() with our renderMarkdown; the sample's Round-trip is lossless (table columns are re-padded on first export). Text alignment and UniqueID ids are not in markdown.",
		},
		"html-export": {
			status: "builtin",
			note: "editor.getHTML(); renderHTML emits the shared data-type/data-name/data-id spans; blocks also carry data-uid (UniqueID) and captioned images become <figure>.",
		},
		"static-render": {
			status: "builtin",
			note: "@tiptap/static-renderer renderToReactElement from JSON (no editor instance); nodeMapping for chips, lowlight, KaTeX and task checkboxes; embeds via renderToHTMLString; markMapping for ruby. Image captions come from the JSX renderHTML.",
		},
		ssr: {
			status: "builtin",
			note: "useEditor({ immediatelyRender: false }). index.tsx lazy-loads editor.tsx and rendered.tsx behind import.meta.env.SSR, so the Worker bundle carries none of the Tiptap code (route chunk 1.99 MB → 2 KB). The static renderer itself is SSR-capable.",
		},
		"thai-ime": {
			status: "partial",
			note: "Manual check. Playwright keyboard.type of Thai text works (that is not a real IME composition).",
		},
	},
	showcase: [
		"Headless: every menu here is our own shadcn component — no Tiptap CSS at all.",
		"Multiple suggestion triggers side by side: / blocks, @ people, {{ variables, : emoji.",
		"Extension API: the variable chip is ~60 lines (Node.create + markdown tokenizer + input/paste rules + React node view).",
		"Two BubbleMenus (text, image) and a FloatingMenu on empty lines, all official positioning with our buttons.",
		"Image resize handles (v3 ResizableNodeView) plus caption, alt text and size presets; captions survive markdown as the image title.",
		"Find & replace with regex / whole word / match case (⌘F), invisible characters, focus mode and read-only in the settings menu.",
		"TextStyleKit: font family (Boonmee Lab fonts first), size, line height, text colour and background; plus highlight, sub/superscript and ruby annotations.",
		"Typography auto-replace while typing: -- → —, (c) → ©, 1/2 → ½, smart quotes.",
		"Details/summary toggles, KaTeX math (click to edit, $…$ migration), YouTube / Twitch / audio embeds, GitHub emoji.",
		"UniqueID on every block, shown on demand through the new Decorations API; NodePos counts in the status bar; live editor event counters.",
		"TableOfContents drives the outline; CharacterCount drives the status bar; NodeRange + drag handle move whole block ranges.",
		"Rendered tab uses @tiptap/static-renderer — JSON → React with no editor instance; image HTML is written with Tiptap's own JSX runtime.",
	],
	findings: [
		"v3 package moves: CharacterCount / Placeholder / Focus / Selection / Gapcursor / Dropcursor / TrailingNode / UndoRedo live in @tiptap/extensions; lists + ListKeymap in @tiptap/extension-list; Color / BackgroundColor / FontFamily / FontSize / LineHeight in @tiptap/extension-text-style (TextStyleKit). The extension-character-count / -placeholder / -task-* / -color / -font-family packages are thin re-exports, and @tiptap/extension-font-size is a deprecated 3.0 pre-release; @tiptap/extension-line-height does not exist.",
		"generateHTML / generateJSON / generateText ship in @tiptap/core for the browser; @tiptap/html is the server build and pulls happy-dom, so we did not install it.",
		"@tiptap/extension-drag-handle statically imports @tiptap/extension-collaboration and @tiptap/y-tiptap → yjs is pulled into the bundle even with no collaboration (pnpm auto-installed the peers).",
		"The docs list a `locked` prop for Drag Handle React, but 3.31.4 ignores it; the lockDragHandle commands only exist on the vanilla extension. We lock it with editor.commands.setMeta('lockDragHandle', true), which the plugin reads.",
		"@tiptap/markdown registers custom tokenizers on the marked instance it is given; we pass `new Marked()` per editor so they do not pile up on the global singleton across remounts.",
		"@tiptap/markdown only applies marks to text nodes: `**{{contract_id}}**` lost its bold both on parse and serialize. Our tokenizers accept one wrapping **/*/~~ around a chip; an atom inside a longer bold run still loses the mark.",
		"Sub/superscript, TextStyle (colour, background, font, size, line height), ruby and coloured highlights have no markdown syntax and were silently dropped. A one-line renderMarkdown per mark that writes inline HTML fixes it: @tiptap/markdown parses inline HTML back with the schema's parseHTML.",
		"Image `resize` gives corner handles but its node view never re-applies width/height after creation, so size presets and undo did not show. Our extend() rebuilds the node view when the size changes and appends the caption.",
		"Markdown has no image size; a resized image is exported as an <img> HTML line (a block-level HTML token) and re-imported correctly — inline HTML images would be dropped because the image node is block-level.",
		"Markdown fidelity on the sample: after the first load only the table changes (columns padded, blank line around it); the page's Round-trip is then lossless. Text alignment, UniqueID ids and details open state are not represented in markdown.",
		"A list item that ends in an empty paragraph exports as an indented blank line ('- a\\n\\n  \\n'); re-import drops it, so Round-trip after such an edit reports a change (upstream @tiptap/markdown).",
		"The Selection extension (keeps a blurred selection highlighted) re-focuses with the old range in a requestAnimationFrame that lands before the click's own selection: after picking from a toolbar menu, the next click into the text was swallowed. We collapse the stale selection on mousedown.",
		"FindAndReplace debounces setSearchTerm (250 ms), so its storage lags behind typing: the search input must keep its own React state.",
		"UniqueID must be part of the static renderer's schema too: the JSON then carries `uid` attrs, and ProseMirror rejects unknown attributes when building nodes from JSON.",
		"Twitch embeds need `parent` = the embedding host; we read window.location.hostname lazily (the route module is imported on the server).",
		'Mention ships its own markdown shortcode `[@ id="u1" label="…"]` and extra HTML attributes; both overridden via Mention.extend.',
		"Mathematics' inline tokenizer turns any `$…$` pair into math on markdown import (e.g. 'costs $5 and $10'). Its katex peer range stops at 0.18; the app has katex 0.19 (works).",
		"Suggestion 3.x has built-in floating-ui positioning (`props.mount(el)`, auto-update, outside-click dismiss) — no tippy.js needed.",
		"Emoji extension is ~620 KB of bundled data and probes emoji support with a canvas (Chrome logs a Canvas2D getImageData warning; jsdom logs 'getContext not implemented').",
		"useEditor in v3 no longer re-renders per transaction: toolbars must use useEditorState. Options must be memoized, otherwise a new extensions array makes useEditor call setOptions every render.",
		"The static renderer runs no node views/decorations: chips, code highlighting and KaTeX needed nodeMapping overrides. It does use renderHTML, including JSX written with @tiptap/core's runtime (`/** @jsxImportSource @tiptap/core */`).",
		"The React static renderer passes raw HTML attributes through as props, so YouTube / Twitch / audio (allowfullscreen, frameborder, cc_language…) and Ruby Text (contenteditable) logged React warnings in the Rendered tab. Embeds now render via renderToHTMLString, ruby via a markMapping.",
		"TableOfContents writes id / data-toc-id attributes into headings, so they show up in the JSON and HTML exports.",
		"Typography auto-replace changes what users typed (quotes, dashes), which then shows in the markdown export.",
		"Radix DropdownMenu returns focus to its trigger when it closes — after the item's command had focused the editor — so typing after picking a block type or colour went nowhere. Every toolbar menu now cancels onCloseAutoFocus.",
		"The route module is imported by the Worker, so a static import of the editor put ~2 MB of Tiptap/ProseMirror into dist/server for nothing (the editor is client-only). Lazy imports behind import.meta.env.SSR drop it from the server build.",
		"The editor dispatches ~8 transactions per command: BubbleMenu, the image BubbleMenu and FloatingMenu each dispatch position-update meta transactions, and every useEditorState selector re-runs on each.",
	],
	inventory,
};
