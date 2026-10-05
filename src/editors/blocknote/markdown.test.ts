import { BlockNoteEditor } from "@blocknote/core";
import { describe, expect, it, vi } from "vitest";
import sample from "@/data/sample.md?raw";
import { normalizeCodeBlocks, resolveCodeLanguage } from "./code-languages";
import {
	blocksToHtml,
	blocksToMarkdown,
	htmlToBlocks,
	markdownToBlocks,
	withExportableMath,
} from "./markdown";
import { type AppBlock, type AppEditor, baseEditorOptions } from "./schema";

// @blocknote/math-block's entry imports "katex/dist/katex.min.css". Vitest loads
// node_modules packages with Node's own loader, which cannot import CSS, so the specs
// are stubbed here with the same configs (plain-content `mathBlock` block and `math`
// inline content). The real math block is covered by e2e/blocknote.spec.ts.
vi.mock("@blocknote/math-block", async () => {
	const { createReactBlockSpec, createReactInlineContentSpec } = await import(
		"@blocknote/react"
	);
	return {
		createReactMathBlockSpec: createReactBlockSpec(
			{ type: "mathBlock", propSchema: {}, content: "plain" },
			{ render: () => null },
		),
		createReactInlineMathSpec: () =>
			createReactInlineContentSpec(
				{ type: "math", propSchema: {}, content: "plain" },
				{ render: () => null },
			),
		// Stand-in for KaTeX: anything with an unbalanced brace is "invalid".
		latexToMathMLElement: (latex: string) => ({
			mathMLElement:
				latex.split("{").length === latex.split("}").length
					? document.createElement("math")
					: null,
		}),
	};
});

function createEditor(): AppEditor {
	return BlockNoteEditor.create(baseEditorOptions) as AppEditor;
}

function load(markdown: string) {
	const editor = createEditor();
	const blocks = markdownToBlocks(editor, markdown);
	editor.replaceBlocks(editor.document, blocks);
	return editor;
}

describe("blocknote markdown bridge", () => {
	it("turns {{name}} and mention links into custom inline content", () => {
		const editor = load(
			"Hi {{customer_name}}, ask [@Suda Rakthai](mention:u2) or [@สมชาย ใจดี](mention:u1).",
		);
		const content = (editor.document[0] as AppBlock).content;
		expect(content).toEqual([
			{ type: "text", text: "Hi ", styles: {} },
			{
				type: "variable",
				props: { name: "customer_name" },
				content: undefined,
			},
			{ type: "text", text: ", ask ", styles: {} },
			{
				type: "mention",
				props: { id: "u2", label: "Suda Rakthai" },
				content: undefined,
			},
			{ type: "text", text: " or ", styles: {} },
			{
				type: "mention",
				props: { id: "u1", label: "สมชาย ใจดี" },
				content: undefined,
			},
			{ type: "text", text: ".", styles: {} },
		]);
	});

	it("serializes custom inline content back to the shared markdown forms", () => {
		const input =
			"Hi {{customer_name}}, ask [@Suda Rakthai](mention:u2) or [@สมชาย ใจดี](mention:u1).";
		expect(blocksToMarkdown(load(input)).trim()).toBe(input);
	});

	it("emits the shared HTML data attributes", () => {
		const html = blocksToHtml(load("Hi {{amount}} [@John Carter](mention:u5)"));
		expect(html).toContain(
			'<span data-type="variable" data-name="amount">{{amount}}</span>',
		);
		expect(html).toContain(
			'<span data-type="mention" data-id="u5">@John Carter</span>',
		);
		expect(html).not.toContain("data-node-view-wrapper");
	});

	it("round-trips the sample after the first import", () => {
		const first = blocksToMarkdown(load(sample));
		const second = blocksToMarkdown(load(first));
		expect(second).toBe(first);
		expect(first).toContain("{{customer_name}}");
		expect(first).toContain("[@Suda Rakthai](mention:u2)");
	});

	it("keeps {{name}} literal inside code blocks", () => {
		const editor = load("```ts\nconst x = '{{amount}}';\n```");
		const [block] = editor.document;
		expect(block?.type).toBe("codeBlock");
		expect(JSON.stringify(block?.content)).toContain("{{amount}}");
		expect(JSON.stringify(block?.content)).not.toContain('"variable"');
	});

	it("restores the Alert block and chips from exported HTML", () => {
		const editor = createEditor();
		const blocks = htmlToBlocks(
			editor,
			'<div role="note" data-alert-type="error">Due <span data-type="variable" data-name="due_date">{{due_date}}</span></div>',
		);
		expect(blocks[0]).toMatchObject({
			type: "alert",
			props: { type: "error" },
			content: [
				{ type: "text", text: "Due " },
				{ type: "variable", props: { name: "due_date" } },
			],
		});
	});
});

describe("math export guard", () => {
	it("drops empty math blocks and turns invalid LaTeX into $ text", () => {
		const blocks = withExportableMath([
			{ type: "mathBlock", content: [] },
			{
				type: "mathBlock",
				content: [{ type: "text", text: "x^{2", styles: {} }],
			},
			{
				type: "mathBlock",
				content: [{ type: "text", text: "x^2", styles: {} }],
			},
			{
				type: "paragraph",
				content: [
					{ type: "math", content: "\\frac{1" },
					{ type: "math", content: "a+b" },
				],
			},
		]);
		expect(blocks).toMatchObject([
			{ type: "paragraph", content: [{ text: "$$x^{2$$" }] },
			{ type: "mathBlock" },
			{
				type: "paragraph",
				content: [{ type: "text", text: "$\\frac{1$" }, { type: "math" }],
			},
		]);
	});
});

describe("code block languages", () => {
	it("maps the ``` shortcut, aliases and unknown fences onto supported ids", () => {
		expect(resolveCodeLanguage("")).toBe("text");
		expect(resolveCodeLanguage("ts")).toBe("typescript");
		expect(resolveCodeLanguage("JS")).toBe("javascript");
		expect(resolveCodeLanguage("mermaid")).toBe("mermaid");
		expect(resolveCodeLanguage("not-a-language")).toBe("text");
		expect(resolveCodeLanguage(undefined)).toBe("text");
	});

	it("normalizes stored JSON, including nested children", () => {
		const [block] = normalizeCodeBlocks([
			{
				type: "paragraph",
				children: [{ type: "codeBlock", props: { language: "py" } }],
			},
		]);
		expect(block).toMatchObject({
			children: [{ type: "codeBlock", props: { language: "python" } }],
		});
	});

	it("gives markdown fences a supported language on import", () => {
		const editor = load("```ts\nlet a = 1;\n```\n\n```\nplain\n```");
		expect(editor.document.map((block) => block.props)).toMatchObject([
			{ language: "typescript" },
			{ language: "text" },
		]);
	});
});
