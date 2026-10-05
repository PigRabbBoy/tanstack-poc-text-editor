import type { EditorMeta } from "@/editors/types";

export const meta: EditorMeta = {
	id: "blocknote",
	name: "BlockNote",
	tagline:
		"Notion-style block editor (ProseMirror/Tiptap underneath) with its whole UI included — shadcn skin.",
	homepage: "https://www.blocknotejs.org",
	packages: ["@blocknote/core", "@blocknote/react", "@blocknote/shadcn"],
	uiApproach:
		"Official @blocknote/shadcn skin: side menu, slash menu, floating formatting toolbar, link toolbar, table handles and file panel all come built in, styled by the app's shadcn CSS variables (Tailwind @source on the package) plus a few --bn-* overrides. Our own radix shadcn leaf components (Button, Input, Label, Badge, Card, Skeleton, Toggle) are injected via `shadCNComponents`; menus, popovers, tooltips, selects and tabs must stay on BlockNote's bundled Base UI versions. The fixed toolbar is BlockNote's FormattingToolbar rendered statically (renderEditor={false} + BlockNoteViewEditor) plus our undo/redo/variable/mention buttons. We wrote the mention/variable inline content, the @ and {{ pickers, and the markdown/HTML bridge.",
	features: {
		marks: {
			status: "builtin",
			note: "Bold, italic, underline, strike, inline code, plus text and background colours.",
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
			status: "partial",
			note: "The code block works and keeps its language prop through markdown. Highlighting needs @blocknote/code-block (shiki), which is not installed. Setting `supportedLanguages` crashes on the bare ``` shortcut.",
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
			note: "getDefaultReactSlashMenuItems plus our Variable and Mention items under a 'Template' group.",
		},
		"drag-handle": {
			status: "builtin",
			note: "Side menu with a + button and a drag handle. Its menu has Delete and Colors.",
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
			note: "blocksToMarkdownLossy after turning chips back into text and links. The second round-trip is lossless. The first one normalises `-`→`*`, `---`→`***` and table padding, and turns soft breaks into `\\` hard breaks.",
		},
		"html-export": {
			status: "partial",
			note: "blocksToHTMLLossy (semantic HTML) plus our toExternalHTML spans. Post-processing removes BlockNote's node-view wrapper span and a stray `classname` attribute.",
		},
		"static-render": {
			status: "builtin",
			note: "Read-only BlockNoteView (editable={false}) fed with editor.document.",
		},
		ssr: {
			status: "partial",
			note: "BlockNote cannot render on the server. The editor and the renderer are React.lazy chunks inside ClientOnly, so the route still server-renders its shell.",
		},
		"thai-ime": {
			status: "partial",
			note: "Manual check needed. Playwright keyboard.type inserts Thai text, but that is not real IME composition.",
		},
	},
	showcase: [
		"The document is block JSON (editor.document). Every block has an id, a type, props (text colour, background colour, alignment) and nested children.",
		"Notion-style side menu: '+' inserts a block, the drag handle reorders it, and its menu deletes the block or sets text and background colours.",
		"Built-in slash menu with groups and keyboard-shortcut badges, extended with Variable and Mention items that open their own pickers.",
		"Native multi-character trigger: typing '{{' opens the variable picker and '@' opens the mention picker.",
		"Tables: merge and split cells, header rows and columns, per-cell text and background colours, column resize, and drag handles for rows and columns.",
		"UI dictionary switch EN ↔ ไทย (top right of the toolbar). BlockNote ships about 23 locales but no Thai one, so this page adds a small Thai override.",
		"Toggle lists and toggle headings (collapsible blocks), emoji picker on ':', and image, video, audio and file blocks with an Upload/Embed panel, resizing and captions.",
		"The Rendered tab is the same BlockNoteView with editable={false}, so the preview looks exactly like the editor.",
	],
	findings: [
		"@blocknote/shadcn 0.55 is built on Base UI and composes triggers with `render={…}`, while the docs still describe Radix. Passing our radix Tooltip or DropdownMenu through `shadCNComponents` made every toolbar button and the drag handle disappear. Only leaf components (Button, Input, Label, Badge, Card, Skeleton, Toggle) can be swapped in.",
		"Markdown import silently drops `[@x](mention:u1)` links: the link mark only allows http, mailto and similar. The fix is `links.isValidLink`. Its JSDoc says to import `isAllowedUri` from @blocknote/core, but 0.55 does not export it.",
		'blocksToHTMLLossy wraps React inline content in its node-view wrapper (`<span as="span" data-node-view-wrapper …>`), except inside table cells, and puts a literal `classname` attribute on links. In dev, TanStack devtools also stamps `data-tsd-source` on toExternalHTML output. We post-process all three away.',
		"Exporting HTML or markdown renders React inline content through flushSync. Calling it from useEffect floods the console with 'flushSync was called from inside a lifecycle method', so serialisation runs on a setTimeout task.",
		"0.55 replaced remark/rehype with a hand-written markdown converter. Text is emitted unescaped, which is why `{{name}}` survives. Custom inline content can't carry styles, so bold or italic around a variable chip is lost on import.",
		"Sample markdown → BlockNote → markdown: the second and later round-trips are lossless (the page reports 'lossless'). The first import changes `-` bullets to `*`, `---` to `***`, pads tables, turns soft line breaks into `\\` + newline with a leading space, and drops `**…**` around variables.",
		"createCodeBlockSpec({ supportedLanguages }) throws 'Language  is not supported.' for the ``` shortcut (language \"\") or any unknown fence language, and that kills the editor. We use the default code block: no picker and no highlighting.",
		"BlockNote is client-only. The editor and renderer are lazy-loaded so importing the route module during SSR does not pull in BlockNote. The UI dictionary is a creation option, so switching language re-creates the editor via useCreateBlockNote deps, and the document has to be carried over by hand.",
		"BlockNote logs a console warning on mount because the root viewport meta lacks `interactive-widget=resizes-content` (a shared __root.tsx change). Resizing or uploading an image can trigger a benign 'ResizeObserver loop' error in the dev overlay.",
		"Columns (xl-multi-column), PDF/DOCX/ODT export (xl-*-exporter) and AI (xl-ai) are GPL or commercial, so they are not used here.",
	],
};
