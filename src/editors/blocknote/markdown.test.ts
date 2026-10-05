import { BlockNoteEditor } from "@blocknote/core";
import { describe, expect, it } from "vitest";
import sample from "@/data/sample.md?raw";
import { blocksToHtml, blocksToMarkdown, markdownToBlocks } from "./markdown";
import { type AppBlock, type AppEditor, baseEditorOptions } from "./schema";

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
});
