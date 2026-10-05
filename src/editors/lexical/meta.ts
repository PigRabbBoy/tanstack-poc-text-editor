import type { EditorMeta, ToolEntry } from "@/editors/types";

const PLAYGROUND = "lexical-playground (ported)";
const REGISTRY = "@shadcn-editor/editor-x";

const inc = (name: string, source: string, howTo: string): ToolEntry => ({
	name,
	source,
	status: "included",
	howTo,
});

const exc = (name: string, source: string, reason: string): ToolEntry => ({
	name,
	source,
	status: "excluded",
	reason,
});

/** Every official @lexical/* package and React plugin, playground plugin and registry item. */
const inventory: ToolEntry[] = [
	// Core and framework
	inc(
		"Lexical core (EditorState, commands, node transforms, NodeState, $config JSON schemas)",
		"lexical",
		"Everything on the page; {{variable}} chips keep their name in NodeState, sticky notes / Excalidraw use $config schemas.",
	),
	inc(
		"LexicalExtensionComposer + defineExtension / configExtension",
		"@lexical/react",
		"The main editor, Rendered preview and lab demos are built from extensions.",
	),
	inc(
		"LexicalComposer (deprecated legacy composer)",
		"@lexical/react",
		"Lab → Legacy API: LexicalComposer + React plugins.",
	),
	inc(
		"ReactExtension / ReactProviderExtension / ReactPluginHostExtension",
		"@lexical/react",
		"Decorator extensions (review, find & replace) and the sticky-note nested editor.",
	),
	inc(
		"LexicalNestedComposer",
		"@lexical/react",
		"Inline image → Edit → Show caption (the caption is a nested editor).",
	),
	inc(
		"LexicalExtensionEditorComposer + NestedEditorExtension + SharedHistoryExtension",
		"@lexical/react, @lexical/extension, @lexical/history",
		"Sticky note text is a nested plain-text editor sharing undo history with the page.",
	),
	inc(
		"ContentEditable + LexicalErrorBoundary",
		"@lexical/react",
		"Every editor surface on the page.",
	),
	inc(
		"React hooks (useLexicalEditable, useLexicalNodeSelection, useLexicalSlotRef, useExtensionSignalValue, useExtensionComponent)",
		"@lexical/react",
		"Used by the registry nodes (images, cards, pull quotes) and the lab.",
	),
	inc(
		"EditorRefPlugin",
		"@lexical/react",
		"Exposes the editor as window.__lexicalPocEditor (devtools / e2e).",
	),
	inc(
		"OnChangePlugin",
		"@lexical/react",
		"Lab → Legacy API: live word count under the editor.",
	),
	inc(
		"NodeEventPlugin",
		"@lexical/react",
		"Double-click a {{variable}} chip to see its sample value.",
	),
	// Rich text, plain text, history
	inc(
		"RichTextExtension (LexicalRichTextPlugin), HeadingNode, QuoteNode",
		"@lexical/rich-text",
		"Main editor; toolbar block-format menu; markdown # and >.",
	),
	inc(
		"PlainTextExtension (LexicalPlainTextPlugin)",
		"@lexical/plain-text",
		"Lab → Plain-text editor (Enter makes a line break).",
	),
	inc(
		"HistoryExtension (LexicalHistoryPlugin)",
		"@lexical/history",
		"Toolbar undo/redo, Ctrl/⌘+Z / Shift+Z.",
	),
	inc(
		"DragonExtension (Dragon NaturallySpeaking support)",
		"@lexical/dragon",
		"Always on; reacts to Dragon dictation messages (no visible UI).",
	),
	inc(
		"TailwindExtension",
		"@lexical/tailwind",
		"Lab → Plain-text editor uses its Tailwind theme.",
	),
	// Lists, links, tables, code
	inc(
		"ListExtension (LexicalListPlugin) with strict indent option",
		"@lexical/list",
		"Toolbar / slash Numbered & Bulleted list, markdown 1. and -; Lab → strict list indent.",
	),
	inc(
		"CheckListExtension (LexicalCheckListPlugin)",
		"@lexical/list",
		"Slash → Check List, markdown - [ ]; Lab → checkbox click keeps focus.",
	),
	inc(
		"LinkExtension (LexicalLinkPlugin) + link attributes",
		"@lexical/link",
		"Toolbar link button, floating link editor; Lab → Link attributes.",
	),
	inc(
		"AutoLinkExtension (LexicalAutoLinkPlugin)",
		"@lexical/link",
		"Type a URL or e-mail address.",
	),
	inc(
		"ClickableLinkExtension (LexicalClickableLinkPlugin)",
		"@lexical/link",
		"Lock (read-only) in the bottom bar, then click a link; Lab → open in new tab.",
	),
	inc(
		"TableExtension (LexicalTablePlugin)",
		"@lexical/table",
		"Toolbar / slash Table, markdown pipe tables; Lab → merge, background, scroll, nested tables, sticky scrollbar.",
	),
	inc(
		"Table cell merge / unmerge",
		"@lexical/table",
		"Drag across cells, cell chevron → Merge cells.",
	),
	inc(
		"Table header row / column",
		"@lexical/table",
		"Cell chevron → Add row header / Add column header.",
	),
	inc(
		"Table cell background colour, vertical align, row striping, frozen first row/column",
		"@lexical/table",
		"Cell chevron → Background color / Vertical align / Toggle …",
	),
	inc(
		"TableActionMenuPlugin",
		PLAYGROUND,
		"Click in a table cell → chevron at its top-right corner.",
	),
	inc(
		"TableCellResizer (column / row resize)",
		PLAYGROUND,
		"Drag the right or bottom edge of a table cell.",
	),
	inc(
		"Table hover actions (registry TableHoverActionsPlugin ≈ playground TableHoverActionsV2)",
		REGISTRY,
		"Hover a table: + buttons add a row or column.",
	),
	inc(
		"TableScrollShadowPlugin",
		PLAYGROUND,
		"Wide tables show an inset shadow on the scrollable side.",
	),
	inc(
		"TableFitNestedTablePlugin",
		PLAYGROUND,
		"Lab → Nested tables + Fit nested tables.",
	),
	inc(
		"CodeExtension + CodeIndentExtension",
		"@lexical/code-core",
		"Toolbar / slash Code, markdown ```; Tab indents inside code.",
	),
	inc(
		"CodeShikiExtension (Shiki highlighter)",
		"@lexical/code-shiki",
		"Default highlighter for code blocks (grammars load on demand).",
	),
	inc(
		"CodePrismExtension (Prism highlighter)",
		"@lexical/code-prism",
		"Lab → Highlighter: Prism (switches live, no rebuild).",
	),
	inc(
		"CodeActionMenuPlugin (language picker, copy, Prettier)",
		PLAYGROUND,
		"Hover a code block: language select, copy, format with Prettier.",
	),
	exc(
		"@lexical/code (umbrella package)",
		"@lexical/code",
		"Transitional re-export of @lexical/code-core, which the page imports directly with code-shiki and code-prism.",
	),
	// Text entities and marks
	inc(
		"HashtagExtension (LexicalHashtagPlugin)",
		"@lexical/hashtag",
		"Type #word in the editor (and in the plain-text / legacy demos).",
	),
	inc(
		"KeywordsExtension",
		PLAYGROUND,
		'Type "congrats" or "ยินดีด้วย" followed by a space.',
	),
	inc(
		"SpecialTextExtension",
		REGISTRY,
		"Lab → Special text, then type [word] + space (links and [@mentions] are left alone).",
	),
	inc(
		"MarkExtension (MarkNode)",
		"@lexical/mark",
		"Comments wrap the selection in marks.",
	),
	inc(
		"Comments (CommentExtension, CommentPlugin, CommentsPanel)",
		REGISTRY,
		"Select text → speech-bubble button in the toolbar; Lab → Comments panel. Kept in memory, no server.",
	),
	inc(
		"OverflowExtension + CharacterLimitPlugin",
		"@lexical/overflow, @lexical/react",
		"Lab → Character limit (UTF-16 or UTF-8): overflow turns red, remaining count in the bottom bar.",
	),
	inc(
		"MaxLengthExtension",
		PLAYGROUND,
		"Lab → Max length (trims anything typed past the limit).",
	),
	inc(
		"AutocompleteExtension",
		REGISTRY,
		"Lab → Autocomplete, then type an English word; Tab or → accepts. Word lists exist for English, Arabic and Hebrew only — Thai gets no suggestions.",
	),
	// Import / export
	inc(
		"Markdown import / export / shortcuts (TRANSFORMERS, registerMarkdownShortcuts)",
		"@lexical/markdown",
		"Page Import MD / Export MD / Round-trip; typing # , - , > , ``` …",
	),
	inc(
		"MarkdownShortcutPlugin",
		"@lexical/react",
		"Lab → Markdown shortcuts engine: @lexical/markdown (default) or Off.",
	),
	inc(
		"MdastExtension + MdastCommonMarkExtension + MdastGfmExtension (experimental)",
		"@lexical/mdast",
		"Lab → Export comparison; copy puts a text/markdown flavour on the clipboard.",
	),
	inc(
		"MdastShortcutsExtension (experimental)",
		"@lexical/mdast",
		"Lab → Markdown shortcuts engine: @lexical/mdast.",
	),
	exc(
		"MdastHtmlExtension / MdastShadowRootQuoteExtension (opt-in mdast import variants)",
		"@lexical/mdast",
		"They only change how raw HTML and blockquotes import from markdown; markdown import here stays on @lexical/markdown so the shared {{variable}} / mention rules apply.",
	),
	inc(
		"$generateHtmlFromNodes / $generateNodesFromDOM",
		"@lexical/html",
		"HTML tab of the preview; registry HTML import.",
	),
	inc(
		"DOMImportExtension + CoreImportExtension (experimental)",
		"@lexical/html",
		"HTML paste and the HTML source mode; {{variable}} and mention spans have import rules.",
	),
	inc(
		"DOMRenderExtension (experimental)",
		"@lexical/html",
		"Powers Visible non-printing characters and the terse HTML export.",
	),
	inc(
		"TerseExportExtension",
		PLAYGROUND,
		"Bottom bar → Edit as HTML (class-free, Prettier-formatted HTML).",
	),
	inc(
		"exportFile / importFile (.lexical JSON)",
		"@lexical/file",
		"Toolbar import / export icons.",
	),
	inc(
		"ClipboardDOMImportExtension",
		"@lexical/clipboard",
		"Paste HTML (routed through DOMImportExtension).",
	),
	inc(
		"ClipboardImportExtension",
		"@lexical/clipboard",
		"Paste plain text containing {{name}} or [@Name](mention:id) → chips.",
	),
	inc(
		"GetClipboardDataExtension",
		"@lexical/clipboard",
		"Copy adds text/markdown next to text/plain, HTML and Lexical JSON.",
	),
	inc(
		"createHeadlessEditor",
		"@lexical/headless",
		"Lab → Export comparison renders the JSON to HTML in a DOM-less editor.",
	),
	inc(
		"$patchStyleText, $setBlocksType and other selection helpers",
		"@lexical/selection",
		"Font family / size / colour, block format, case changes.",
	),
	inc(
		"Utilities (mergeRegister, $dfs, $insertNodeToNearestRoot …)",
		"@lexical/utils",
		"Used throughout the plugins.",
	),
	inc(
		"OffsetView",
		"@lexical/offset",
		"Bottom bar: caret offset / document length.",
	),
	inc(
		"Text helpers (registerLexicalTextEntity, $rootTextContent, $canShowPlaceholder)",
		"@lexical/text",
		"Keywords, the caret offset and visible non-printing characters.",
	),
	inc(
		"nodeArbitrary (schema-derived fast-check arbitraries)",
		"@lexical/fast-check",
		"Lab → Schema fuzzing samples random node JSON.",
	),
	// @lexical/extension
	inc(
		"AutoFocusExtension (LexicalAutoFocusPlugin)",
		"@lexical/extension",
		"The editor is focused on load.",
	),
	inc(
		"ClearEditorExtension (LexicalClearEditorPlugin)",
		"@lexical/extension",
		"Toolbar trash icon; Lab → Legacy API Clear button.",
	),
	inc(
		"ClickAfterLastBlockExtension",
		"@lexical/extension",
		"Click below a final table/image to get a new paragraph (Lab toggle).",
	),
	inc(
		"DecoratorTextExtension (DecoratorTextNode)",
		"@lexical/extension",
		"{{variable}} chips are DecoratorTextNodes that keep bold/italic.",
	),
	inc(
		"EditorStateExtension",
		"@lexical/extension",
		"Drives the caret-offset readout.",
	),
	inc(
		"HorizontalRuleExtension (LexicalHorizontalRulePlugin)",
		"@lexical/extension",
		"Toolbar / slash divider, markdown ---.",
	),
	inc(
		"KeyboardShortcutsExtension",
		"@lexical/extension",
		"Registry shortcuts (Ctrl/⌘+Alt+1…3 headings, Ctrl/⌘+Shift+7/8/9 lists …); bottom-bar keyboard icon lists them.",
	),
	inc(
		"TabIndentationExtension (LexicalTabIndentationPlugin)",
		"@lexical/extension",
		"Tab / Shift+Tab indent (Lab toggle).",
	),
	inc(
		"SelectBlockExtension + PreventSelectAllExtension",
		"@lexical/extension",
		"Ctrl/⌘+A selects the block, again selects all (Lab toggle).",
	),
	inc(
		"SelectionAlwaysOnDisplayExtension (LexicalSelectionAlwaysOnDisplay)",
		"@lexical/extension",
		"Lab → Retain selection when blurred.",
	),
	inc(
		"NodeSelectionExtension + NodeSelectionDataSelectedExtension",
		"@lexical/extension",
		"Selected images get data-selected; rules use node selection.",
	),
	inc(
		"IMEExtension, RootElementExtension, WatchEditableExtension, InitialStateExtension, NormalizeInlineElements / NormalizeTripleClickSelection",
		"@lexical/extension",
		"Infrastructure under autocomplete, clickable links and rich text (no own UI).",
	),
	exc(
		"HMRExtension",
		"@lexical/extension",
		"Tried: it restores the previous editor state whenever the editor is rebuilt under Vite, which also happens on this page's Reset / Round-trip / Import remounts, so it silently undid them.",
	),
	// Accessibility
	inc(
		"AriaLiveRegionExtension (useLexicalAriaLiveRegion)",
		"@lexical/a11y",
		"Share / source-mode actions announce their result to screen readers.",
	),
	inc(
		"HistoryAnnounce, EditorModeAnnounce, HeadingAnnounce, AutoLinkAnnounce",
		"@lexical/a11y, @lexical/rich-text, @lexical/link",
		"Undo/redo, read-only, heading and auto-link changes are announced (Lab toggle).",
	),
	inc(
		"FocusManagerExtension (useLexicalFocusManagerRef)",
		"@lexical/a11y",
		"Alt+F10 jumps to the toolbar, Escape returns to the text.",
	),
	inc(
		"RovingTabIndexExtension (useLexicalRovingTabIndexRef)",
		"@lexical/a11y",
		"Arrow keys move between toolbar buttons.",
	),
	inc(
		"FocusTrapExtension (useLexicalFocusTrapRef)",
		"@lexical/a11y",
		"Tab stays inside the Excalidraw modal.",
	),
	// React plugins / UI building blocks
	inc(
		"LexicalTypeaheadMenuPlugin",
		"@lexical/react",
		"Slash menu (/), mentions (@), emoji (:), variables ({{).",
	),
	inc(
		"LexicalAutoEmbedPlugin + LexicalNodeMenuPlugin",
		"@lexical/react",
		"Paste a YouTube, X or Figma URL → embed menu.",
	),
	inc(
		"LexicalBlockWithAlignableContents + DecoratorBlockNode",
		"@lexical/react",
		"YouTube / X / Figma embeds.",
	),
	inc(
		"DraggableBlockPlugin (experimental)",
		"@lexical/react",
		"Hover a block: + and drag handle on the left.",
	),
	inc(
		"NodeContextMenuPlugin",
		"@lexical/react",
		"Lab → Right-click menu: Lexical NodeContextMenuPlugin.",
	),
	inc(
		"LexicalTableOfContentsPlugin",
		"@lexical/react",
		"Lab → Table of contents panel.",
	),
	inc(
		"TreeView / TreeViewExtension (debug view, time travel)",
		"@lexical/react, @lexical/devtools-core",
		"Lab → Tree view (debug).",
	),
	exc(
		"Lexical DevTools browser extension",
		"Chrome / Firefox extension",
		"A browser add-on, not something a page can embed; TreeView above shows the same tree.",
	),
	// shadcn-editor registry UI
	inc("Toolbar (fixed, wraps onto rows)", REGISTRY, "Top of the editor."),
	inc(
		"Block format, font family, font size, text & background colour",
		REGISTRY,
		"Toolbar row 1.",
	),
	inc(
		"Text formats (bold … code, sub/superscript, highlight, case), clear formatting",
		REGISTRY,
		"Toolbar row 2 and the floating toolbar.",
	),
	inc("Alignment, indent / outdent", REGISTRY, "Toolbar row 2."),
	inc(
		"Floating text-format toolbar (playground FloatingTextFormatToolbarPlugin)",
		REGISTRY,
		"Select text.",
	),
	inc(
		"Floating link editor (playground FloatingLinkEditorPlugin)",
		REGISTRY,
		"Click a link or the toolbar link button.",
	),
	inc(
		"Component picker / slash menu (playground ComponentPickerPlugin)",
		REGISTRY,
		"Type / — paragraph, headings, tables, lists, quote, code, divider, columns, image, card, collapsible, dates, pull quote, review, poll, page break, inline image, GIF, Excalidraw, sticky note, variables.",
	),
	inc(
		"Block insert buttons (code, columns, emoji, equation, rule, image, table, YouTube, X, Figma)",
		REGISTRY,
		"Toolbar row 3.",
	),
	inc(
		"Emoji picker (:) and emoticon → emoji (playground EmojiPickerPlugin + EmojisExtension)",
		REGISTRY,
		'Type ":smi" for the picker or ":)" for 🙂.',
	),
	inc(
		"Mentions (playground MentionsPlugin)",
		REGISTRY,
		"Type @ — users from the shared list.",
	),
	inc(
		"Images (playground ImagesExtension) + drag/drop/paste (DragDropPasteExtension)",
		REGISTRY,
		"Toolbar / slash Image, or drop a file; base64 ≤ 1 MB.",
	),
	inc(
		"Inline images (InlineImageNode, float left/right/full, caption)",
		PLAYGROUND,
		"Toolbar image-plus icon or slash → Inline Image.",
	),
	inc(
		"GIF insert",
		PLAYGROUND,
		"Toolbar GIF icon or slash → GIF picks a .gif (≤ 1 MB; the playground's bundled cat GIF is 1.1 MB, over the cap).",
	),
	inc("Equations (KaTeX)", REGISTRY, "Toolbar √ or slash."),
	inc(
		"Columns layout (LayoutContainer / LayoutItem)",
		REGISTRY,
		"Toolbar columns icon or slash → Columns.",
	),
	inc("Collapsible container", REGISTRY, "Slash → Collapsible."),
	inc("Card, Pull quote, Review (stars)", REGISTRY, "Slash menu."),
	inc("Poll", REGISTRY, "Slash → Poll."),
	inc(
		"Date & time chip",
		REGISTRY,
		"Slash → Date & time / Today / Tomorrow / Yesterday.",
	),
	inc(
		"Ruby (furigana) text + floating ruby editor",
		REGISTRY,
		"Toolbar 文A icon.",
	),
	inc(
		"YouTube, X (Twitter), Figma embeds + auto-embed",
		REGISTRY,
		"Toolbar icons or paste a URL.",
	),
	inc("Find & replace (case / regex)", REGISTRY, "Toolbar magnifier icon."),
	inc("Import / export .lexical, clear editor", REGISTRY, "Toolbar right end."),
	inc(
		"Context menu (cut/copy/paste/paste as plain text/delete)",
		REGISTRY,
		"Right-click in the editor.",
	),
	inc(
		"Activity bar: word & character count (Intl.Segmenter), speech to text, read-only toggle, keyboard shortcuts",
		REGISTRY,
		"Bottom bar of the editor.",
	),
	inc(
		"Speech to text (Web Speech API)",
		REGISTRY,
		"Bottom-bar microphone (Chrome; audio goes to the browser vendor's service).",
	),
	inc(
		"Tab focus (TabFocusExtension)",
		REGISTRY,
		"Tab into the editor from the page: the caret lands at the start of the document.",
	),
	inc(
		"i18n: English / العربية / עברית with RTL (LanguageProvider + DirectionProvider)",
		REGISTRY,
		"Bottom-bar language select switches UI strings and text direction.",
	),
	inc(
		"Table of contents (registry TableOfContentsPlugin)",
		REGISTRY,
		"Lab → Table of contents.",
	),
	inc(
		"Chat input / chat message editors",
		REGISTRY,
		"Lab → Chat input (messages echo locally).",
	),
	exc(
		"AI extension, AI picker, AI floating editor, AI toolbar",
		REGISTRY,
		"AI features need an LLM key/endpoint (ADR-0005); the files were not vendored.",
	),
	// Playground-only plugins
	inc(
		"PageBreakNode / PageBreakExtension",
		PLAYGROUND,
		"Toolbar scissors or slash → Page Break; markdown <!-- pagebreak -->.",
	),
	inc(
		"PagesExtension (paginated A3–Letter pages, page setup)",
		PLAYGROUND,
		"Lab → Pages demo (separate editor: it wraps the document in page nodes that markdown cannot express).",
	),
	inc(
		"Sticky notes (StickyNode)",
		PLAYGROUND,
		"Toolbar sticky-note icon or slash → Sticky Note; drag to move, palette to recolour.",
	),
	inc(
		"Excalidraw drawings",
		`${PLAYGROUND} + @excalidraw/excalidraw`,
		"Toolbar pen icon or slash → Excalidraw; double-click a drawing to edit, drag the corner to resize.",
	),
	inc(
		"VisibleNonPrintingExtension (¶ ↵ → · markers)",
		PLAYGROUND,
		"Lab → Visible non-printing characters.",
	),
	inc(
		"ActionsPlugin: share link, Markdown mode, HTML mode",
		PLAYGROUND,
		"Bottom bar: share, Edit as Markdown, Edit as HTML (click again to convert back).",
	),
	inc(
		"Settings panel (playground Settings)",
		PLAYGROUND,
		"Lab → settings; each switch flips an extension signal without rebuilding the editor.",
	),
	inc("TypingPerfPlugin", PLAYGROUND, "Lab → Typing performance."),
	inc("PasteLogPlugin", PLAYGROUND, "Lab → Paste log."),
	inc(
		"TestRecorderPlugin",
		PLAYGROUND,
		"Lab → Test recorder (prints a Playwright test).",
	),
	inc("DocsPlugin", PLAYGROUND, "Bottom-bar book icon links to lexical.dev."),
	exc(
		"Render in Shadow DOM (playground setting)",
		PLAYGROUND,
		"The page's Tailwind/shadcn styles are document-level and base-ui popovers portal to document.body, so a shadow-root copy would render unstyled.",
	),
	// Collaboration and tooling
	exc(
		"CollaborationPlugin / LexicalCollaborationContext",
		"@lexical/react",
		"Real-time collaboration needs a sync server (ADR-0005).",
	),
	exc(
		"Yjs bindings",
		"@lexical/yjs",
		"Real-time collaboration needs a sync provider (ADR-0005).",
	),
	exc(
		"Collaboration, split screen, versions, comment sync (playground)",
		PLAYGROUND,
		"Need a WebSocket/Yjs server (ADR-0005); comments here stay local.",
	),
	exc(
		"@lexical/eslint-plugin",
		"@lexical/eslint-plugin",
		"An ESLint rule set; this repo lints with Biome and it has no runtime part.",
	),
	exc(
		"@lexical/compiler",
		"@lexical/compiler",
		"A build-time tree-shaking/inlining transform; it would go in vite.config.ts (shared), and has nothing to show on the page.",
	),
	exc(
		"@lexical/internal",
		"@lexical/internal",
		'Marked "do not import directly"; it is only a dependency of the other packages.',
	),
];

export const meta: EditorMeta = {
	id: "lexical",
	name: "Lexical",
	tagline:
		"Meta's framework-agnostic editor engine, dressed with the community shadcn-editor (editor-x) registry plus ports of the Lexical playground.",
	homepage: "https://lexical.dev",
	packages: [
		"lexical",
		"@lexical/react",
		"@lexical/extension",
		"@lexical/rich-text",
		"@lexical/plain-text",
		"@lexical/list",
		"@lexical/link",
		"@lexical/table",
		"@lexical/markdown",
		"@lexical/mdast",
		"@lexical/html",
		"@lexical/history",
		"@lexical/selection",
		"@lexical/utils",
		"@lexical/code-core",
		"@lexical/code-shiki",
		"@lexical/code-prism",
		"@lexical/file",
		"@lexical/mark",
		"@lexical/hashtag",
		"@lexical/overflow",
		"@lexical/clipboard",
		"@lexical/headless",
		"@lexical/offset",
		"@lexical/text",
		"@lexical/dragon",
		"@lexical/devtools-core",
		"@lexical/a11y",
		"@lexical/tailwind",
		"@lexical/fast-check",
		"fast-check",
		"@excalidraw/excalidraw",
		"prettier",
		"@base-ui/react",
		"katex",
		"emojibase-data",
		"date-fns",
		"react-day-picker",
		"cmdk",
	],
	uiApproach:
		"Lexical 0.52 extension API (LexicalExtensionComposer + defineExtension) composed from the community shadcn-editor registry item @shadcn-editor/editor-x (MIT, copied into src/editors/lexical with its base-ui shadcn primitives), plus Lexical-playground plugins ported to Tailwind/shadcn in components/playground (table action menu, cell resizer, code action menu, sticky notes, Excalidraw, page breaks, pages, inline images, visible non-printing, dev tools). A Lab panel mirrors the playground's settings by writing extension config signals. We added the {{variable}} DecoratorTextNode, the {{ typeahead, slash items, markdown/mdast/HTML/clipboard rules, USERS-backed mentions and BML theme overrides.",
	features: {
		marks: {
			status: "builtin",
			note: "Core TextNode formats; toolbar + floating toolbar from the registry (also sub/superscript, highlight, case, colour, font family/size).",
		},
		headings: { status: "builtin", note: "@lexical/rich-text HeadingNode." },
		lists: {
			status: "builtin",
			note: "@lexical/list; nested lists export with 4-space indent; strict-indent option in the Lab.",
		},
		"task-list": {
			status: "builtin",
			note: "CheckListExtension (- [ ] / - [x]).",
		},
		link: {
			status: "builtin",
			note: "@lexical/link LinkExtension + AutoLink + ClickableLink (read-only); floating link editor from the registry.",
		},
		blockquote: { status: "builtin" },
		"code-block": {
			status: "builtin",
			note: "Shiki (@lexical/code-shiki, lazy grammars) or Prism (@lexical/code-prism), switchable live; playground code action menu adds language picker, copy and Prettier.",
		},
		table: {
			status: "builtin",
			note: "@lexical/table with cell merge, headers, background colour, striping, frozen rows/columns, nested tables. The action menu and column resizer are playground code we ported; the markdown TABLE transformer and hover actions are registry code.",
		},
		image: {
			status: "kit",
			note: "Registry ImageNode (resizable) plus the playground's InlineImageNode (float + caption) and a GIF picker. Upload/drop/paste go through fileToDataUrl with a toast over 1 MB.",
		},
		"undo-redo": { status: "builtin", note: "HistoryExtension." },
		"slash-menu": {
			status: "kit",
			note: "Registry ComponentPicker on LexicalTypeaheadMenuPlugin; we added Variable, Page Break, Inline Image, GIF, Excalidraw and Sticky Note items.",
		},
		"drag-handle": {
			status: "kit",
			note: "DraggableBlockPlugin_EXPERIMENTAL (official, experimental) wrapped by the registry with a + button.",
		},
		"floating-toolbar": { status: "kit" },
		"fixed-toolbar": {
			status: "kit",
			note: "Many buttons; the registry scrolls them sideways, so the POC wraps them onto extra rows. Alt+F10 / arrow keys via @lexical/a11y.",
		},
		"markdown-shortcuts": {
			status: "builtin",
			note: "MarkdownShortcutPlugin with the shared transformers (typing {{name}} converts too); the Lab can switch to @lexical/mdast's shortcuts or off.",
		},
		mention: {
			status: "custom",
			note: "Registry MentionNode/plugin adapted: carries a user id, reads USERS, exports the shared HTML/markdown (also through mdast, HTML paste and plain-text paste).",
		},
		variable: {
			status: "custom",
			note: "DecoratorTextNode (inline, keeps bold/italic), custom {{ trigger matcher, slash items, markdown + mdast + DOM import rules.",
		},
		"markdown-import": {
			status: "builtin",
			note: "$convertFromMarkdownString + our MENTION/VARIABLE transformers placed before LINK.",
		},
		"markdown-export": {
			status: "partial",
			note: "Round-trip on the sample is lossless (idempotent). Normalises *** / nested indent; page breaks export as <!-- pagebreak --> and inline images as ![](…), but registry blocks (collapsible, poll, card, review, columns, embeds), comments, sticky notes and Excalidraw drawings have no markdown form and are dropped or flattened.",
		},
		"html-export": {
			status: "builtin",
			note: "$generateHtmlFromNodes; our nodes' exportDOM emit the shared data attributes. A terse, Prettier-formatted variant is the HTML source mode.",
		},
		"static-render": {
			status: "builtin",
			note: "A second Lexical editor with editable: false loads the JSON (not a static string renderer); @lexical/headless renders HTML without a DOM in the Lab.",
		},
		ssr: {
			status: "partial",
			note: "Route SSR works, but the editor/preview are React.lazy client-only; Lexical renders nothing on the server. The lazy imports are gated on import.meta.env.SSR so the Worker build leaves Lexical out entirely.",
		},
		"thai-ime": {
			status: "partial",
			note: "Manual check. Playwright keyboard.type of Thai text works (not real IME composition). Autocomplete has no Thai word list.",
		},
	},
	showcase: [
		"Lexical lab (below the editor): every playground setting as a live switch — Prism ⇄ Shiki, special text, autocomplete, character limit, max length, table options, visible ¶ markers, RTL — no editor rebuild.",
		"Table action menu: click a cell → chevron → merge/unmerge, header row/column, cell colour, vertical align, striping, freeze first row/column; drag cell edges to resize.",
		"Excalidraw drawings, draggable sticky notes, page breaks and a paginated A3–Letter Pages demo, all ported from the Lexical playground.",
		"Edit as Markdown / Edit as HTML in the bottom bar turns the document into source and back; Share puts the whole document in the URL.",
		"Export comparison: @lexical/markdown vs the experimental micromark-based @lexical/mdast vs a @lexical/headless HTML render, side by side.",
		"Debug tools: Tree view with time travel, paste log, typing-performance meter and a test recorder that prints a Playwright test.",
		"Find & replace with case/regex, Shiki highlighting with line numbers, code action menu with Prettier.",
		"Equations (KaTeX), emoji picker (type :), ruby text, YouTube / X / Figma embeds with paste-to-embed.",
		"Accessibility from @lexical/a11y: Alt+F10 jumps to the toolbar, arrows rove, undo/read-only/headings are announced.",
		"Type {{ for the variable picker; double-click a chip to see its sample value. Paste plain text with {{name}} and it becomes chips.",
		"Also on the page: a plain-text editor (@lexical/plain-text + @lexical/tailwind), the legacy LexicalComposer plugin API, a chat input, and schema fuzzing with @lexical/fast-check.",
	],
	findings: [
		"Lexical 0.52's extension API (LexicalExtensionComposer/defineExtension) supersedes LexicalComposer, which is now @deprecated (still works: the Lab's legacy demo uses it). Most extensions expose their config as signals, so the playground's settings can be switched live without rebuilding the editor.",
		"All @lexical/* packages are ESM-only; no issues with Vite 8, vitest or React 19.2. 34 @lexical/* packages exist at 0.52; only @lexical/code (a re-export), yjs, eslint-plugin, compiler and internal are not on the page.",
		"Many headline features (table action menu, column resizer, code action menu, sticky notes, Excalidraw, page breaks, pages, inline images, keywords, max length, visible non-printing, typing perf, test recorder) live only in the playground source, not in an npm package; we ported them (MIT) into components/playground. InlineImageNode was removed from the playground after 0.3x and was ported from v0.35.",
		"The registry's SpecialTextExtension turned every [text] into a node, breaking typed markdown links and [@mention](...) syntax. Fixed by making it opt-in (disabled signal, like the playground) and only converting [text] once a space follows and never for [@…] or [x].",
		"Autocomplete ships English, Arabic and Hebrew word lists only; Thai input gets no suggestions (detectLanguage falls back to English).",
		"HMRExtension restores the last editor state on every rebuild under Vite, including the page's Reset/Round-trip remounts, so it was taken out after it broke the Reset e2e test.",
		"useSignalValue (useSyncExternalStore) on EditorStateExtension + TreeView + CharacterLimitPlugin hit React's 'Maximum update depth exceeded'; subscribing to the signal with plain useState fixed it.",
		"The new @lexical/html DOMImportExtension pipeline (HTML paste, HTML source mode) ignores legacy importDOM, so the {{variable}}/mention spans needed defineImportRule rules too.",
		"SelectBlockExtension (playground default) makes Ctrl/⌘+A select the current block first; select-all needs a second press.",
		"PagesExtension stores page setup in root NodeState and only reacts to its mutation, so the demo sets it after mount; it wraps content in PageNodes, which @lexical/markdown cannot express, so it lives in a separate Lab editor.",
		"The registry's TableOfContentsPlugin used SidebarMenuButton, which needs a SidebarProvider whose Ctrl/⌘+B shortcut would steal bold; swapped for a plain button.",
		"Markdown: text-match transformers must precede LINK or [@x](mention:u1) becomes a link. DecoratorTextNode keeps text format, but Lexical's exportFormat helper only accepts TextNodes, so bold/italic around a chip is wrapped manually (and again as mdast strong/emphasis).",
		"The registry TABLE transformer hard-codes its cell transformers; we turned it into a factory so {{amount}} in a cell becomes a chip.",
		"buildEditorFromExtensions applies $initialEditorState asynchronously; in unit tests use editor.update(..., { discrete: true }). React-dependent extensions also need ReactProviderExtension when headless.",
		"Excalidraw (≈1 MB), Prettier parsers and fast-check are dynamic imports, loaded only when used. Vite's dev server re-optimises these deps the first time they are hit, which reloads the page once.",
		"Gating the lazy editor/preview imports on import.meta.env.SSR drops all Lexical code from the Cloudflare Worker build (dist/server went from 61 MB to 41 MB in this worktree; the rest is the other editors).",
		"Speech-to-text uses the browser Web Speech API (free, but Chrome sends audio to Google); kept, disabled when unsupported.",
	],
	inventory,
};
