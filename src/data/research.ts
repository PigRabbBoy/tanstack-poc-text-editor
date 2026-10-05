import type { EditorId } from "@/editors/types";

export type ResearchEntry = {
	id: EditorId;
	name: string;
	tagline: string;
	engine: string;
	documentModel: string;
	maintainer: string;
	license: string;
	paid: string[];
	version: string;
	releasedAt: string;
	releaseCadence?: string;
	bundleSizeGzip?: string;
	stats: {
		githubStars: number;
		openIssues: number;
		openIssuesNote?: string;
		weeklyDownloads: number;
		downloadsPackage: string;
		downloadsWindow?: string;
	};
	features: { group: string; items: string[] }[];
	pros: string[];
	cons: string[];
	limitations: string[];
	bestFor: string[];
	notFor: string[];
	sources: { label: string; url: string }[];
};

export type Research = {
	asOf: string;
	notes: string[];
	editors: ResearchEntry[];
};

/**
 * Desk research gathered from primary sources (docs, GitHub, npm) on the date in `asOf`.
 * Claims marked "(unverified)" could not be confirmed from a primary source.
 */
export const RESEARCH: Research = {
	asOf: "2026-10-05",
	notes: [
		"GitHub stats from GitHub search API (2026-10-05); openIssues = GitHub open_issues_count which includes open PRs",
		"Downloads: npm API last-week window 2026-09-28..2026-10-04",
		"Bundle sizes from Bundlephobia API, not tree-shaken; indicative only",
	],
	editors: [
		{
			id: "plate",
			name: "Plate",
			tagline:
				"Build rich-text editors with Plate, Plate UI, AI, MCP, and shadcn/ui.",
			engine:
				"Slate (via @platejs/slate wrapping slate 0.126.2 + slate-dom; Slate itself is still 0.x)",
			documentModel:
				"Slate JSON: array of element nodes { type, children: [...], ...attrs } with leaf text nodes { text, bold?: true, ... } (marks as boolean props on text leaves)",
			maintainer:
				"Udecode (Ziad Beyens, Felix Feng et al.); community OSS with commercial Plate Plus",
			license:
				"MIT (repo root and all @platejs/* packages checked on npm, incl. ai, markdown, yjs, dnd, table, comment, suggestion, docx)",
			paid: [
				"Plate Plus (pro.platejs.org): EUR 299 one-time Personal / EUR 799 one-time Teams (up to 5 users)",
				"Plate Plus includes 100+ premium components and templates (Minimal, Playground, Potion Notion-like full-stack template)",
				"Core engine, plugins and open shadcn registry components remain MIT/free",
			],
			version: "53.3.15",
			releasedAt: "2026-10-03",
			releaseCadence:
				"Patch releases every 1-2 weeks (53.3.3 -> 53.3.15 Aug-Oct 2026); majors ~every 1-5 months (49.0.0 Jun 2025, 51 Oct 2025, 52 Nov 2025, 53 Apr 2026); 54.0.0-beta published Jun 2026",
			stats: {
				githubStars: 16631,
				openIssues: 19,
				openIssuesNote:
					"GitHub open_issues_count includes PRs; issues tab shows 14 open issues",
				weeklyDownloads: 539044,
				downloadsPackage: "platejs",
				downloadsWindow: "2026-09-28..2026-10-04",
			},
			bundleSizeGzip:
				"platejs 97.0 kB min+gz per Bundlephobia (whole package incl. @platejs/core + slate; excludes React and plugins)",
			features: [
				{
					group: "Editing basics",
					items: [
						"Marks: bold/italic/underline/strike/code/sub/superscript, font color/size via @platejs/basic-styles",
						"Lists, links, mentions, emoji, date elements, slash command menu",
					],
				},
				{
					group: "Blocks/structure",
					items: [
						"Headings, blockquote, code block, callouts, toggles, columns, tables (@platejs/table), media embeds",
						"Block selection + drag-and-drop (@platejs/selection, @platejs/dnd)",
					],
				},
				{
					group: "Collaboration",
					items: [
						"Yjs via @platejs/yjs: Hocuspocus, WebRTC and IndexedDB providers sharing one Y.Doc",
						"Remote cursors (RemoteCursorOverlay); comments (@platejs/comment) and track-changes style suggestions (@platejs/suggestion)",
					],
				},
				{
					group: "AI",
					items: [
						"@platejs/ai: AI command menu, streaming Markdown/MDX insertion, copilot, diff-based accept/reject of AI edits",
						"Built on Vercel AI SDK (@ai-sdk/react); you host the streaming endpoint (BYOK)",
						"MCP listed in repo topics/tagline",
					],
				},
				{
					group: "Serialization",
					items: [
						"Slate JSON native",
						"Markdown <-> Plate via @platejs/markdown (remark/mdast), GFM, math, footnotes, MDX for custom elements (round-trip)",
						"HTML export via serializeHtml (uses PlateStatic); DOCX import via @platejs/docx",
					],
				},
				{
					group: "Extensibility",
					items: [
						"Plugin system (createPlatePlugin) with typed options/API/transforms",
						"UI copied into your repo via shadcn CLI registry (Plate UI), Tailwind-based",
					],
				},
				{
					group: "Accessibility/i18n",
					items: [
						"Inherits Slate contenteditable behavior; historical CJK IME bugs mostly closed in Plate, but upstream Slate has many long-open Android/IME issues",
						"No Thai-specific issues found (unverified Thai behavior)",
					],
				},
				{
					group: "Mobile",
					items: [
						"Works in mobile browsers; Android input is Slate's weakest area (upstream issues #4400, #5643, #5989 open)",
						"Open Plate issue: floating toolbar overlaps native context menu on mobile",
					],
				},
				{
					group: "SSR",
					items: [
						"<PlateStatic>/createStaticEditor render read-only content in SSR/RSC without browser APIs",
						"Editable editor is a client component",
					],
				},
			],
			pros: [
				"MIT end to end, including AI, collaboration, comments, suggestions, markdown and DOCX plugins",
				"Batteries-included Notion-like UX via shadcn registry: you own the component code",
				"First-class Tailwind/shadcn styling fits a modern React stack",
				"Static renderer for SSR/RSC (PlateStatic, serializeHtml)",
				"Strong Markdown/MDX round-trip story via remark/mdast",
				"Very actively maintained (pushes daily; patch releases ~weekly)",
				"Small open issue backlog (14 issues open on GitHub)",
			],
			cons: [
				"Frequent major versions with breaking changes (majors 35->49 within ~12 months in 2024-25 under @udecode/plate)",
				"Package was renamed @udecode/plate -> platejs at v49 (May/Jun 2025): migration churn, outdated tutorials",
				"Slate foundation is still 0.x and has weaker Android/IME support than ProseMirror/Lexical",
				"shadcn copy-paste UI means you own and must upgrade many component files manually",
				"Large API surface/plugin count; steep learning curve beyond the templates",
				"Best templates (Potion, premium components) are in paid Plate Plus",
				"React-only",
			],
			limitations: [
				"Upstream Slate has ~110 Android/IME-related issues, many long-open (e.g. slate#4400 AndroidEditable vs IME, slate#5989 Hangul composition breaks with placeholder)",
				"Open Plate issues on markdown deserialization: deserializeMd drops rest of document on <user@host> with remarkMdx; node filters skip children of marks",
				"@platejs/markdown does not process raw HTML tags; needs MDX modelling or separate sanitizing",
				"Yjs: must set skipInitialization: true and manually init()/destroy() providers; useEditorSelection() reported not working with YjsPlugin",
				"Table: clicks on unmapped DOM regions can desync selection and crash toSlateRange (open issue)",
				"Bundle: ~97 kB gz for platejs alone before plugins/UI (Bundlephobia)",
			],
			bestFor: [
				"Notion-like editors in a shadcn/Tailwind React app where you want to own the UI code",
				"Products needing AI editing, comments and suggestions without paying for licenses",
				"Content apps that need Markdown/MDX round-trip and SSR/RSC read-only rendering",
			],
			notFor: [
				"Mobile-first apps with heavy Android/IME (CJK, Thai) input",
				"Teams wanting a stable API with rare breaking changes",
				"Non-React frameworks",
			],
			sources: [
				{
					label: "Plate docs intro",
					url: "https://platejs.org/docs",
				},
				{
					label: "Plate markdown docs",
					url: "https://platejs.org/docs/markdown",
				},
				{
					label: "Plate static rendering docs",
					url: "https://platejs.org/docs/static",
				},
				{
					label: "Plate AI docs",
					url: "https://platejs.org/docs/ai",
				},
				{
					label: "Plate Yjs docs",
					url: "https://platejs.org/docs/yjs",
				},
				{
					label: "Plate Plus pricing",
					url: "https://pro.platejs.org",
				},
				{
					label: "GitHub repo (stars/issues via GitHub search API)",
					url: "https://github.com/udecode/plate",
				},
				{
					label: "Open issues list",
					url: "https://github.com/udecode/plate/issues",
				},
				{
					label: "Repo LICENSE",
					url: "https://raw.githubusercontent.com/udecode/plate/main/LICENSE",
				},
				{
					label: "npm platejs (versions, deps, release times)",
					url: "https://www.npmjs.com/package/platejs",
				},
				{
					label: "npm downloads API",
					url: "https://api.npmjs.org/downloads/point/last-week/platejs",
				},
				{
					label: "Bundlephobia platejs",
					url: "https://bundlephobia.com/package/platejs@53.3.15",
				},
				{
					label: "Slate issue #4400 (Android IME)",
					url: "https://github.com/ianstormtaylor/slate/issues/4400",
				},
				{
					label: "Slate issue #5989 (Hangul composition)",
					url: "https://github.com/ianstormtaylor/slate/issues/5989",
				},
				{
					label: "Slate issue #5643 (Android autocomplete)",
					url: "https://github.com/ianstormtaylor/slate/issues/5643",
				},
				{
					label: "Plate issue #3938 (mobile Chinese IME, closed)",
					url: "https://github.com/udecode/plate/issues/3938",
				},
			],
		},
		{
			id: "blocknote",
			name: "BlockNote",
			tagline:
				"An extensible React rich text editor with support for block-based editing, real-time collaboration, and comes with ready-to-use customizable UI components.",
			engine:
				"ProseMirror via Tiptap (@blocknote/core depends on @tiptap/core ^3.31.3, @tiptap/pm, prosemirror-*)",
			documentModel:
				"BlockNote JSON (editor.document): Block[] where Block = { id, type, props, content: InlineContent[] | TableContent, children: Block[] }; lossless, recommended storage format",
			maintainer:
				"TypeCell team (TypeCellOS org; Yousef El-Dardiry, Matthew Lipski et al.), sponsored by NLnet; paid Business/Enterprise tiers",
			license:
				"MPL-2.0 for core/react/mantine/shadcn/ariakit/server-util; @blocknote/xl-* packages are 'GPL-3.0 OR PROPRIETARY'",
			paid: [
				"Business plan $195/month ($2,340/year): commercial license for XL packages (xl-ai, xl-multi-column, xl-pdf/docx/odt/email exporters) + standard support",
				"Enterprise: custom pricing (custom features, private Slack, priority support)",
				"XL packages free only for GPL-3.0 compatible (open-source) apps",
			],
			version: "0.55.0",
			releasedAt: "2026-09-22",
			releaseCadence:
				"Minor (0.x) releases roughly every 1-5 weeks (0.48 Apr 2026 -> 0.55 Sep 2026); each minor may contain breaking changes; still pre-1.0",
			stats: {
				githubStars: 10262,
				openIssues: 209,
				openIssuesNote: "GitHub open_issues_count includes PRs",
				weeklyDownloads: 881335,
				downloadsPackage: "@blocknote/core",
				downloadsWindow: "2026-09-28..2026-10-04",
			},
			bundleSizeGzip:
				"@blocknote/core 178.1 kB min+gz main chunk per Bundlephobia (plus lazy chunks; excludes React UI package)",
			features: [
				{
					group: "Editing basics",
					items: [
						"Formatting toolbar, link toolbar, slash (/) menu, emoji picker, mentions via suggestion menus",
						"Undo/redo, keyboard shortcuts, markdown-style input rules",
					],
				},
				{
					group: "Blocks/structure",
					items: [
						"Notion-style blocks: paragraph, headings, lists, checklist, toggle, quote, code (shiki highlight), table, image/video/audio/file",
						"Side menu with drag handle to reorder/nest blocks; custom block types via createReactBlockSpec",
						"Multi-column layout (xl-multi-column, GPL/commercial)",
					],
				},
				{
					group: "Collaboration",
					items: [
						"Yjs-based real-time collab; docs list Yjs, Liveblocks and PartyKit integrations",
						"Comments built into community tier",
					],
				},
				{
					group: "AI",
					items: [
						"@blocknote/xl-ai on Vercel AI SDK, any LLM; streaming, accept/reject suggestions (GPL-3.0 or commercial)",
					],
				},
				{
					group: "Serialization",
					items: [
						"BlockNote JSON is lossless (recommended)",
						"Markdown and HTML import/export are documented as lossy",
						"Server-side conversion via @blocknote/server-util (depends on jsdom)",
						"PDF/DOCX/ODT/email exporters are XL (GPL/commercial)",
					],
				},
				{
					group: "Extensibility",
					items: [
						"Custom blocks, inline content and styles via typed schema",
						"UI kits: Mantine, shadcn, Ariakit (@blocknote/mantine|shadcn|ariakit)",
						"Drop down to Tiptap/ProseMirror extensions for advanced cases",
					],
				},
				{
					group: "Accessibility/i18n",
					items: [
						"23 built-in UI dictionaries (ar, de, en, es, fa, fr, he, hr, is, it, ja, ko, nl, no, pl, pt, ru, sk, uk, uz, vi, zh, zh-tw) - no Thai dictionary",
						"Past CJK IME bugs in suggestion/link menus (#1065, #1070, #1283) are closed",
						"RTL: side-menu repositioning issue #2091 (closed)",
					],
				},
				{
					group: "Mobile",
					items: [
						"Drag-to-reorder on mobile is an open problem (#1693 'Dragging doesn't work on mobile', #3045 iOS touch drag scroll bug)",
					],
				},
				{
					group: "SSR",
					items: [
						"Client-only: docs say BlockNote 'should only be rendered client-side'; Next.js needs 'use client' + dynamic(..., { ssr: false })",
					],
				},
			],
			pros: [
				"Fastest path to a polished Notion-like block editor: UI, slash menu, drag handles out of the box",
				"Typed, block-level JSON API that is easy to store and manipulate",
				"Built on battle-tested ProseMirror/Tiptap (good IME baseline)",
				"Collaboration and comments included in the free tier",
				"Choice of UI kits incl. shadcn",
				"High adoption for its niche (~880k weekly downloads)",
				"Active releases (minor every few weeks)",
			],
			cons: [
				"Still 0.x: minor releases can break APIs",
				"Copyleft split: AI, multi-column and PDF/DOCX export require GPL compliance or $195/mo",
				"MPL-2.0 core requires publishing modifications to BlockNote source files",
				"Opinionated block model: hard to do classic free-flow document editing (e.g. arbitrary nesting, inline layouts)",
				"Markdown/HTML conversion is lossy",
				"Heaviest bundle of the four (~178 kB gz core per Bundlephobia)",
				"No SSR of the editor; React-only",
			],
			limitations: [
				"Markdown/HTML export documented as lossy; e.g. reference-style links issue #3117 (fixed Sep 2026) shows fidelity edge cases",
				"Mobile drag & drop unreliable (open #1693, #3045)",
				"Must be client-only (dynamic import with ssr:false in Next.js)",
				"No Thai locale dictionary shipped (must supply custom dictionary)",
				"DOCX export list numbering bug open (#2227)",
				"Tied to Tiptap 3 + ProseMirror versions; mixing your own Tiptap version can conflict (unverified)",
				"Pre-1.0 API; minor bumps may require migration",
			],
			bestFor: [
				"Notion-style block editors (notes, docs, knowledge bases) needed quickly",
				"Apps storing structured block JSON (e.g. per-block DB rows, AI pipelines)",
				"Open-source (GPL-compatible) apps wanting AI + exports for free",
			],
			notFor: [
				"Closed-source products that need AI/PDF/DOCX export but cannot pay $195/mo",
				"Markdown-first storage where lossless round-trip is required",
				"SSR-rendered editable content or non-React frameworks",
			],
			sources: [
				{
					label: "BlockNote docs overview",
					url: "https://www.blocknotejs.org/docs",
				},
				{
					label: "Supported formats (lossy markdown/html)",
					url: "https://www.blocknotejs.org/docs/foundations/supported-formats",
				},
				{
					label: "Next.js / client-only guidance",
					url: "https://www.blocknotejs.org/docs/getting-started/nextjs",
				},
				{
					label: "BlockNote AI docs",
					url: "https://www.blocknotejs.org/docs/features/ai",
				},
				{
					label: "Pricing",
					url: "https://www.blocknotejs.org/pricing",
				},
				{
					label: "README license section",
					url: "https://github.com/TypeCellOS/BlockNote/blob/main/README.md",
				},
				{
					label: "GitHub repo",
					url: "https://github.com/TypeCellOS/BlockNote",
				},
				{
					label: "npm @blocknote/core (version, deps, locales from tarball)",
					url: "https://www.npmjs.com/package/@blocknote/core",
				},
				{
					label: "npm @blocknote/xl-ai (license field)",
					url: "https://www.npmjs.com/package/@blocknote/xl-ai",
				},
				{
					label: "npm downloads API",
					url: "https://api.npmjs.org/downloads/point/last-week/@blocknote/core",
				},
				{
					label: "Bundlephobia @blocknote/core",
					url: "https://bundlephobia.com/package/@blocknote/core@0.55.0",
				},
				{
					label: "Issue #1693 mobile dragging",
					url: "https://github.com/TypeCellOS/BlockNote/issues/1693",
				},
				{
					label: "Issue #3045 iOS touch drag",
					url: "https://github.com/TypeCellOS/BlockNote/issues/3045",
				},
				{
					label: "Issue #1065 CJK double input (closed)",
					url: "https://github.com/TypeCellOS/BlockNote/issues/1065",
				},
				{
					label: "Issue #2091 RTL side menu",
					url: "https://github.com/TypeCellOS/BlockNote/issues/2091",
				},
				{
					label: "Issue #3117 markdown reference links",
					url: "https://github.com/TypeCellOS/BlockNote/issues/3117",
				},
				{
					label: "Issue #2227 DOCX list numbering",
					url: "https://github.com/TypeCellOS/BlockNote/issues/2227",
				},
			],
		},
		{
			id: "lexical",
			name: "Lexical",
			tagline:
				"An extensible text editor framework for the web, built for reliability, accessibility, and performance.",
			engine:
				"Own engine (dependency-free core with immutable EditorState and DOM reconciliation); framework-agnostic with @lexical/react bindings",
			documentModel:
				"SerializedEditorState JSON: { root: { type:'root', children:[{ type:'paragraph', children:[{ type:'text', text:'Hello', format:1 }] }] } }; text formats are bitflags on TextNode; v0.51+ compact schema via $config (version field deprecated)",
			maintainer:
				"Meta (facebook/lexical), open source with external contributors",
			license: "MIT (all @lexical/* packages)",
			paid: ["None - fully MIT; no official paid UI kit or cloud"],
			version: "0.52.0",
			releasedAt: "2026-09-28",
			releaseCadence:
				"Minor 0.x release every ~2-6 weeks (0.49 Jul 30, 0.50 Sep 2, 0.51 Sep 17, 0.52 Sep 28 2026) plus nightly builds; most minors list breaking changes",
			stats: {
				githubStars: 23929,
				openIssues: 319,
				openIssuesNote: "GitHub open_issues_count includes PRs",
				weeklyDownloads: 6981220,
				downloadsPackage: "lexical",
				downloadsWindow: "2026-09-28..2026-10-04",
			},
			bundleSizeGzip:
				"lexical core 63.0 kB min+gz per Bundlephobia (unminified-dev export map may inflate; tree-shaken prod build likely smaller - unverified)",
			features: [
				{
					group: "Editing basics",
					items: [
						"Rich text and plain text plugins, history (300ms merge default), lists, links, marks, hashtags, autolink",
						"Commands + listeners + node transforms API",
					],
				},
				{
					group: "Blocks/structure",
					items: [
						"ElementNode/TextNode/DecoratorNode model; DecoratorNode renders arbitrary React (images, embeds)",
						"Tables (@lexical/table), code highlighting, nested editors for captions",
					],
				},
				{
					group: "Collaboration",
					items: [
						"Yjs binding (@lexical/yjs) + CollaborationPlugin; docs: y-websocket is the only officially supported provider",
						"Comment plugin exists in playground only, described as not production ready",
					],
				},
				{
					group: "AI",
					items: [
						"No official AI package (none found on npm/docs) - build your own",
					],
				},
				{
					group: "Serialization",
					items: [
						"Lossless JSON (exportJSON / $config schemas)",
						"HTML via @lexical/html ($generateHtmlFromNodes, extension-based DOM import)",
						"Markdown via @lexical/markdown transformers and new @lexical/mdast (CommonMark/GFM via micromark)",
					],
				},
				{
					group: "Extensibility",
					items: [
						"New Extension system (@lexical/extension, LexicalExtensionComposer) - LexicalComposer deprecated in 0.51",
						"Custom nodes with declarative serialization schemas",
					],
				},
				{
					group: "Accessibility/i18n",
					items: [
						"README claims built-in accessibility/WCAG; new @lexical/a11y package (ARIA live regions, focus mgmt) and screen-reader announcements in 0.50",
						"RTL: long-open 'Full bidirectional (RTL) support' #2610; open Safari RTL backspace bug #7773",
						"IME: open 'CJK composition broken in android firefox' #6377",
					],
				},
				{
					group: "Mobile",
					items: [
						"0.52.0 was an ad-hoc release for mobile text input fixes",
						"Multiple open Android/iOS bugs (#5413 backspace on Android, #7566 Android ZWS insertion, #7886 bold/italic on Android WebView 12)",
					],
				},
				{
					group: "SSR",
					items: [
						"Editor itself is client-side; headless editor (@lexical/headless) for server; HTML import/export on server needs withDOM() from @lexical/headless/dom",
					],
				},
			],
			pros: [
				"Backed by Meta and used across Meta web products; also Payload CMS, Proton Docs, Supabase per docs",
				"Very high adoption (~7M weekly downloads)",
				"MIT with no paid tiers or license traps",
				"Own engine with immutable state, good performance, framework-agnostic core",
				"Lossless JSON + HTML + Markdown (mdast GFM) serialization",
				"Serious accessibility investment (@lexical/a11y, announcements)",
				"Very active (nightlies daily, releases every few weeks)",
			],
			cons: [
				"Still 0.x after years; nearly every minor ships breaking changes",
				"No official UI kit: toolbars, menus, slash command, drag handles must be built (playground code is reference only)",
				"0.51 went ESM-only (no CommonJS) - may break older tooling/Jest setups",
				"API migration in progress (LexicalComposer -> extension-based composer)",
				"Smaller ready-made ecosystem than Tiptap/ProseMirror",
				"Collaboration only officially supports y-websocket; must bootstrap initial state server-side",
			],
			limitations: [
				"Breaking changes every minor: 0.49 (nodes ported to $config, LexicalCommand typing), 0.50 (slot/clipboard), 0.51 (ESM-only, exportJSON), 0.52 (SELECTION_CHANGE_COMMAND order, HTML export)",
				"Open mobile/IME bugs: #6377 CJK on Android Firefox, #5413 Android backspace, #7566 Android ZWS",
				"RTL full bidi support still open since 2022 (#2610)",
				"Collab: two clients initializing concurrently can corrupt the doc; document switch requires remount",
				"Markdown export edge cases historically (e.g. invalid markdown for overlapping formats #4895, closed)",
				"Supported browsers: Chrome 86+, Firefox 115+, Safari 15+",
			],
			bestFor: [
				"Custom editors where you want full control and an MIT, no-vendor stack",
				"Performance-sensitive or large-scale apps (comment boxes, chat composers, CMS fields)",
				"Teams willing to build their own UI on top of a solid engine",
			],
			notFor: [
				"POCs needing a Notion-like UI out of the box",
				"Teams that cannot absorb frequent 0.x breaking-change upgrades",
				"RTL-heavy products (bidi support incomplete)",
			],
			sources: [
				{
					label: "Lexical intro docs",
					url: "https://lexical.dev/docs/intro",
				},
				{
					label: "Serialization docs",
					url: "https://lexical.dev/docs/serialization/",
				},
				{
					label: "Compared with ProseMirror",
					url: "https://lexical.dev/docs/concepts/compared-with-prosemirror",
				},
				{
					label: "Collaboration (React)",
					url: "https://lexical.dev/docs/collaboration/react",
				},
				{
					label: "GitHub releases (0.49-0.52 breaking changes)",
					url: "https://github.com/facebook/lexical/releases",
				},
				{
					label: "README (browser support, a11y claims)",
					url: "https://github.com/facebook/lexical/blob/main/README.md",
				},
				{
					label: "GitHub repo",
					url: "https://github.com/facebook/lexical",
				},
				{
					label: "npm lexical (versions/ESM exports)",
					url: "https://www.npmjs.com/package/lexical",
				},
				{
					label: "npm @lexical/a11y",
					url: "https://www.npmjs.com/package/@lexical/a11y",
				},
				{
					label: "npm downloads API",
					url: "https://api.npmjs.org/downloads/point/last-week/lexical",
				},
				{
					label: "Bundlephobia lexical",
					url: "https://bundlephobia.com/package/lexical@0.52.0",
				},
				{
					label: "Issue #6377 CJK Android Firefox",
					url: "https://github.com/facebook/lexical/issues/6377",
				},
				{
					label: "Issue #2610 Full RTL support",
					url: "https://github.com/facebook/lexical/issues/2610",
				},
				{
					label: "Issue #7773 RTL backspace Safari",
					url: "https://github.com/facebook/lexical/issues/7773",
				},
				{
					label: "Issue #5413 Android backspace",
					url: "https://github.com/facebook/lexical/issues/5413",
				},
				{
					label: "Issue #7566 Android ZWS",
					url: "https://github.com/facebook/lexical/issues/7566",
				},
				{
					label: "Issue #7886 Android WebView bold/italic",
					url: "https://github.com/facebook/lexical/issues/7886",
				},
				{
					label: "Issue #4895 markdown overlapping formats",
					url: "https://github.com/facebook/lexical/issues/4895",
				},
			],
		},
		{
			id: "tiptap",
			name: "Tiptap",
			tagline:
				"A headless rich-text editor framework that lets you build a custom editor completely tailored to your and your customers' needs. (GitHub: 'The headless rich text editor framework for web artisans.')",
			engine:
				"ProseMirror (@tiptap/pm re-exports prosemirror-*); headless, framework-agnostic (React, Vue, Svelte, vanilla)",
			documentModel:
				"ProseMirror JSON: { type:'doc', content:[{ type:'paragraph', attrs?, content:[{ type:'text', text:'Hi', marks:[{ type:'bold' }] }] }] }; schema defined by extensions",
			maintainer:
				"Tiptap GmbH (ueberdosis, Berlin) - VC-backed company with Tiptap Cloud",
			license:
				"MIT for editor core and open-source extensions (incl. markdown, static-renderer, drag-handle, unique-id, file-handler, emoji, table-of-contents, mathematics, details); paid Pro/Cloud features via private registry",
			paid: [
				"Start $49/mo annual ($59 monthly), Team $149/mo annual ($179 monthly), Business $999/mo annual ($1,199 monthly), Enterprise custom",
				"Paid: Notion-like template (requires Start plan for production), UI components for Comments/Version History, Collaboration Cloud docs, Comments, Conversion (DOCX/ODT/PDF), Document History, Pages (Team+)",
				"AI Toolkit is a custom-priced add-on",
				"Free: MIT editor, Simple Editor template and UI components for open-source extensions; Hocuspocus server is MIT (self-host collab)",
			],
			version: "3.31.4",
			releasedAt: "2026-09-30",
			releaseCadence:
				"Patch/minor releases roughly weekly (3.29.1 Jul 27 -> 3.31.4 Sep 30 2026); v3 stable line since Jul 2025 (3.0.1 on 2025-07-12); v2 still receives backports (2.27.3 Sep 2026)",
			stats: {
				githubStars: 38640,
				openIssues: 837,
				openIssuesNote: "GitHub open_issues_count includes PRs",
				weeklyDownloads: 25340374,
				downloadsPackage: "@tiptap/core",
				downloadsWindow: "2026-09-28..2026-10-04",
			},
			bundleSizeGzip:
				"@tiptap/core 35.6 kB min+gz per Bundlephobia, excluding peer @tiptap/pm (ProseMirror) which adds substantially (not measured - rate-limited)",
			features: [
				{
					group: "Editing basics",
					items: [
						"StarterKit (paragraph, headings, lists, bold/italic/strike/code, link, undo/redo)",
						"Commands chaining API, input rules, paste rules, TextStyleKit",
					],
				},
				{
					group: "Blocks/structure",
					items: [
						"TableKit, ListKit, task lists, details/toggle, mathematics, table of contents, images, code blocks",
						"Drag handle (@tiptap/extension-drag-handle-react, MIT); React NodeViews/MarkViews",
					],
				},
				{
					group: "Collaboration",
					items: [
						"@tiptap/extension-collaboration + CollaborationCaret on Yjs; self-host with MIT Hocuspocus or use paid Tiptap Cloud",
						"Comments and version history are paid platform features",
					],
				},
				{
					group: "AI",
					items: [
						"AI Toolkit / Content AI are paid add-ons (custom pricing); nothing official in MIT core",
					],
				},
				{
					group: "Serialization",
					items: [
						"JSON (getJSON) and HTML (getHTML, @tiptap/html for server)",
						"Official @tiptap/markdown (MarkedJS-based) - docs call it an early release with edge cases",
						"@tiptap/static-renderer: JSON -> HTML/Markdown/React without an editor instance",
						"DOCX/ODT/PDF conversion is paid",
					],
				},
				{
					group: "Extensibility",
					items: [
						"Huge extension ecosystem; Extension/Node/Mark APIs with full ProseMirror escape hatch",
						"UI components installed via CLI as source files (MIT for open-source-extension components)",
					],
				},
				{
					group: "Accessibility/i18n",
					items: [
						"Inherits ProseMirror IME handling; v3 notes improved mobile and IME input",
						"Many long-open CJK IME issues (e.g. #4499, #7271 WebKit heading duplicate, #5584 Safari table, #2780 iPhone Japanese)",
						"No Thai-specific issues found (unverified)",
					],
				},
				{
					group: "Mobile",
					items: [
						"Simple Editor template advertised as mobile-friendly; open Android issues like #4606 (compositionend on blank line) and #4221 (Enter duplicates with collab cursor)",
					],
				},
				{
					group: "SSR",
					items: [
						"React: set immediatelyRender: false + 'use client' to avoid hydration mismatches in Next.js",
						"Server-side HTML generation via @tiptap/html / static renderer",
					],
				},
			],
			pros: [
				"Largest adoption by far (~25M weekly downloads of @tiptap/core, 38.6k stars)",
				"Stable 3.x semver line (not 0.x) with weekly releases",
				"Headless: total UI control; works with React, Vue, Svelte, vanilla",
				"ProseMirror foundation: mature schema, transactions, collab",
				"Many formerly-Pro extensions are now MIT (drag handle, unique-id, file handler, emoji, ToC, mathematics, details)",
				"MIT Simple Editor template + CLI-installed UI components",
				"Static renderer and official markdown package in v3",
			],
			cons: [
				"Headless means you build most UI unless you pay (Notion-like template needs Start plan)",
				"Valuable collaboration features (Cloud, comments, history, DOCX conversion, AI) are paid/vendor-hosted",
				"Large open issue/PR backlog (837)",
				"ProseMirror concepts leak through for anything advanced (steep curve)",
				"Total bundle with @tiptap/pm is larger than core suggests",
				"v2 -> v3 migration had many breaking changes (ESM-only, renamed extensions, shouldRerenderOnTransaction default false)",
			],
			limitations: [
				"@tiptap/markdown is an early release; round-trip bugs reported (#8134 escaped blocks open; #8294, #8318 recently fixed); comments lost on markdown replace; one child node per table cell",
				"Long-open CJK IME bugs on iOS/Safari/WebKit (#4726, #5416, #7271, #5584)",
				"SSR requires immediatelyRender: false; editor content not server-rendered unless using static renderer",
				"React re-render behavior changed in v3 (shouldRerenderOnTransaction false) - easy to miss UI state updates",
				"Pro packages come from private registry (@tiptap-pro not on public npm) - needs auth token in CI",
				"Collaboration Cloud document quotas per plan (500/5,000/50,000 per env)",
			],
			bestFor: [
				"Custom-branded editors where you want full UI control on a stable, mature engine",
				"Multi-framework orgs (React + Vue/Svelte)",
				"Teams that may later buy managed collaboration/AI/conversion instead of building it",
			],
			notFor: [
				"Zero-budget POCs wanting a Notion-like UX out of the box (Notion template is paid)",
				"Markdown-as-source-of-truth apps needing guaranteed lossless round-trip today",
			],
			sources: [
				{
					label: "Tiptap overview docs",
					url: "https://tiptap.dev/docs/editor/getting-started/overview",
				},
				{
					label: "Next.js install (immediatelyRender)",
					url: "https://tiptap.dev/docs/editor/getting-started/install/nextjs",
				},
				{
					label: "Markdown docs",
					url: "https://tiptap.dev/docs/editor/markdown",
				},
				{
					label: "What's new in v3",
					url: "https://tiptap.dev/docs/resources/whats-new",
				},
				{
					label: "UI components overview",
					url: "https://tiptap.dev/docs/ui-components/getting-started/overview",
				},
				{
					label: "Notion-like template",
					url: "https://tiptap.dev/docs/ui-components/templates/notion-like-editor",
				},
				{
					label: "Simple Editor template",
					url: "https://tiptap.dev/docs/ui-components/templates/simple-editor",
				},
				{
					label: "Pricing",
					url: "https://tiptap.dev/pricing",
				},
				{
					label: "GitHub repo",
					url: "https://github.com/ueberdosis/tiptap",
				},
				{
					label: "npm @tiptap/core (versions/peers)",
					url: "https://www.npmjs.com/package/@tiptap/core",
				},
				{
					label: "npm downloads API",
					url: "https://api.npmjs.org/downloads/point/last-week/@tiptap/core",
				},
				{
					label: "Bundlephobia @tiptap/core",
					url: "https://bundlephobia.com/package/@tiptap/core@3.31.4",
				},
				{
					label: "Issue #4499 No Japanese/Chinese support",
					url: "https://github.com/ueberdosis/tiptap/issues/4499",
				},
				{
					label: "Issue #7271 Chinese IME duplicate in headings (WebKit)",
					url: "https://github.com/ueberdosis/tiptap/issues/7271",
				},
				{
					label: "Issue #4726 iOS Chinese marks",
					url: "https://github.com/ueberdosis/tiptap/issues/4726",
				},
				{
					label: "Issue #4606 Android compositionend",
					url: "https://github.com/ueberdosis/tiptap/issues/4606",
				},
				{
					label: "Issue #8134 markdown escaped blocks",
					url: "https://github.com/ueberdosis/tiptap/issues/8134",
				},
				{
					label: "Issue #8294 markdown table pipe (closed)",
					url: "https://github.com/ueberdosis/tiptap/issues/8294",
				},
				{
					label: "npm @hocuspocus/server (MIT)",
					url: "https://www.npmjs.com/package/@hocuspocus/server",
				},
			],
		},
	],
};
