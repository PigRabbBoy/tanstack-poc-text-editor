/**
 * Markdown / HTML bridge for BlockNote.
 *
 * BlockNote's own `tryParseMarkdownToBlocks` / `blocksToMarkdownLossy` know nothing about
 * custom inline content, so this layer:
 *  - import: parses markdown with BlockNote, then walks every inline array and splits
 *    `{{name}}` text and `mention:` links (or literal `[@Label](mention:id)` text) into
 *    `variable` / `mention` inline content;
 *  - export: replaces `variable` with plain text `{{name}}` and `mention` with a link to
 *    `mention:id` labelled `@Label` *before* calling BlockNote's serializer, which emits
 *    text verbatim and links as `[text](href)` — so the shared forms come out exactly.
 */
import { latexToMathMLElement } from "@blocknote/math-block";
import { findUser } from "@/data/users";
import {
	MENTION_HREF_PREFIX,
	tokenizeInline,
	variableMarkdown,
} from "@/lib/conventions";
import { normalizeCodeBlocks } from "./code-languages";
import type { AppBlock, AppEditor, AppPartialBlock } from "./schema";

// Block JSON is walked structurally; the schema-typed unions are too deep to narrow usefully here.
type Json = Record<string, unknown>;
type Inline = Json & { type: string };
type InlineMapper = (item: Inline) => Inline[];

/** Blocks whose content is plain source text: `{{x}}` there is literal code, LaTeX or Mermaid. */
const PLAIN_BLOCKS = new Set(["codeBlock", "mathBlock", "diagram"]);

function isRecord(value: unknown): value is Json {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mapInlineArray(items: unknown[], mapper: InlineMapper): Inline[] {
	return items.flatMap((item) =>
		isRecord(item) && typeof item.type === "string"
			? mapper(item as Inline)
			: [item as Inline],
	);
}

function mapTableContent(table: Json, mapper: InlineMapper): Json {
	const rows = Array.isArray(table.rows) ? table.rows : [];
	return {
		...table,
		rows: rows.map((row: Json) => ({
			...row,
			cells: (Array.isArray(row.cells) ? row.cells : []).map(
				(cell: unknown) => {
					if (Array.isArray(cell)) return mapInlineArray(cell, mapper);
					if (isRecord(cell) && Array.isArray(cell.content))
						return { ...cell, content: mapInlineArray(cell.content, mapper) };
					return cell;
				},
			),
		})),
	};
}

/** Returns a deep copy of `blocks` with every inline item passed through `mapper`. */
export function mapInlineContent<T>(blocks: T[], mapper: InlineMapper): T[] {
	return blocks.map((block) => {
		const source = block as Json;
		const next: Json = { ...source };
		if (PLAIN_BLOCKS.has(String(source.type))) {
			// Plain source text is left alone; nested blocks are still mapped.
		} else if (Array.isArray(source.content))
			next.content = mapInlineArray(source.content, mapper);
		else if (isRecord(source.content) && source.content.type === "tableContent")
			next.content = mapTableContent(source.content, mapper);
		if (Array.isArray(source.children))
			next.children = mapInlineContent(source.children, mapper);
		return next as T;
	});
}

function textOf(link: Json): string {
	const content = Array.isArray(link.content) ? link.content : [];
	return content
		.map((item: unknown) =>
			isRecord(item) && typeof item.text === "string" ? item.text : "",
		)
		.join("");
}

/** text / link → text + variable + mention (import direction). */
export const toCustomInline: InlineMapper = (item) => {
	if (
		item.type === "link" &&
		typeof item.href === "string" &&
		item.href.startsWith(MENTION_HREF_PREFIX)
	) {
		const id = item.href.slice(MENTION_HREF_PREFIX.length);
		const label = textOf(item).replace(/^@/, "") || findUser(id)?.name || id;
		return [{ type: "mention", props: { id, label } }];
	}
	if (item.type !== "text" || typeof item.text !== "string") return [item];
	if (isRecord(item.styles) && item.styles.code) return [item];
	if (!item.text.includes("{{") && !item.text.includes("](mention:"))
		return [item];
	return tokenizeInline(item.text)
		.filter((token) => token.type !== "text" || token.text.length > 0)
		.map((token): Inline => {
			if (token.type === "variable")
				return { type: "variable", props: { name: token.name } };
			if (token.type === "mention")
				return {
					type: "mention",
					props: { id: token.id, label: token.label },
				};
			return { ...item, text: token.text };
		});
};

/** variable + mention → text + link (export direction). */
export const toSharedInline: InlineMapper = (item) => {
	const props = isRecord(item.props) ? item.props : {};
	if (item.type === "variable")
		return [
			{ type: "text", text: variableMarkdown(String(props.name)), styles: {} },
		];
	if (item.type === "mention")
		return [
			{
				type: "link",
				href: `${MENTION_HREF_PREFIX}${String(props.id)}`,
				content: [
					{ type: "text", text: `@${String(props.label)}`, styles: {} },
				],
			},
		];
	return [item];
};

export function markdownToBlocks(
	editor: AppEditor,
	markdown: string,
): AppPartialBlock[] {
	const parsed = editor.tryParseMarkdownToBlocks(markdown);
	return normalizeCodeBlocks(
		mapInlineContent(parsed, toCustomInline),
	) as AppPartialBlock[];
}

export function htmlToBlocks(
	editor: AppEditor,
	html: string,
): AppPartialBlock[] {
	const parsed = editor.tryParseHTMLToBlocks(html);
	return normalizeCodeBlocks(
		mapInlineContent(parsed, toCustomInline),
	) as AppPartialBlock[];
}

function rendersLatex(latex: string, inline: boolean): boolean {
	try {
		return latexToMathMLElement(latex, inline).mathMLElement !== null;
	} catch {
		return false;
	}
}

function plainText(content: unknown): string {
	if (typeof content === "string") return content;
	return textOf({ content });
}

/**
 * @blocknote/math-block 0.55 renders no external HTML for empty or invalid LaTeX, and
 * BlockNote's HTML serializer (which markdown export also uses) then throws reading
 * `firstChild.classList`. That happens on every keystroke while a formula is typed, so
 * before exporting, an empty math block is dropped, invalid LaTeX becomes `$$…$$` /
 * `$…$` text (the markdown notation), and valid math is left to the math package.
 */
export function withExportableMath<T>(blocks: T[]): T[] {
	return blocks.flatMap((block) => {
		const source = block as Json;
		const next: Json = { ...source };
		if (source.type === "mathBlock") {
			const latex = plainText(source.content);
			if (!latex.trim()) return [];
			if (!rendersLatex(latex, false))
				Object.assign(next, {
					type: "paragraph",
					props: {},
					content: [{ type: "text", text: `$$${latex}$$`, styles: {} }],
				});
		} else if (Array.isArray(source.content)) {
			next.content = source.content.flatMap((item: unknown) =>
				isRecord(item) &&
				item.type === "math" &&
				!rendersLatex(plainText(item.content), true)
					? [{ type: "text", text: `$${plainText(item.content)}$`, styles: {} }]
					: [item],
			);
		}
		if (Array.isArray(source.children))
			next.children = withExportableMath(source.children);
		return [next as T];
	});
}

export function blocksToMarkdown(
	editor: AppEditor,
	blocks: AppBlock[] = editor.document,
): string {
	const shared = mapInlineContent(
		withExportableMath(blocks),
		toSharedInline,
	) as AppPartialBlock[];
	return editor.blocksToMarkdownLossy(shared);
}

/**
 * Semantic (external) HTML: `<p>`, `<ul>`, `<table>`… plus our `toExternalHTML` spans
 * with the shared `data-type` attributes. `blocksToFullHTML` would instead dump
 * BlockNote's internal `bn-block-outer` div soup, which only renders with BlockNote CSS.
 */
export function blocksToHtml(
	editor: AppEditor,
	blocks: AppBlock[] = editor.document,
): string {
	return cleanExternalHtml(
		editor.blocksToHTMLLossy(withExportableMath(blocks) as AppPartialBlock[]),
	);
}

/**
 * `blocksToHTMLLossy` wraps React inline content in its node-view wrapper
 * (`<span as="span" class="bn-inline-content-section" data-node-view-wrapper …>`) around
 * our `toExternalHTML` output, and in dev TanStack's devtools plugin stamps
 * `data-tsd-source` on every JSX element. Unwrap / strip both so the shared
 * `<span data-type=…>` form is what consumers see.
 */
export function cleanExternalHtml(html: string): string {
	if (typeof DOMParser === "undefined") return html;
	const doc = new DOMParser().parseFromString(
		`<body>${html}</body>`,
		"text/html",
	);
	for (const wrapper of doc.body.querySelectorAll("[data-node-view-wrapper]"))
		wrapper.replaceWith(...wrapper.childNodes);
	for (const element of doc.body.querySelectorAll("[data-tsd-source]"))
		element.removeAttribute("data-tsd-source");
	// BlockNote 0.55 emits a literal `classname="…"` attribute on links (React prop leak).
	for (const element of doc.body.querySelectorAll("a[classname]"))
		element.removeAttribute("classname");
	for (const element of doc.body.querySelectorAll(
		'[data-type="variable"], [data-type="mention"]',
	))
		element.removeAttribute("data-inline-content-type");
	return doc.body.innerHTML;
}
