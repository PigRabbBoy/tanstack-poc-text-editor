import { Editor } from "@tiptap/react";
import { afterEach, describe, expect, it } from "vitest";
import sample from "@/data/sample.md?raw";
import { schemaExtensions } from "./extensions";

const editors: Editor[] = [];

function load(markdown: string) {
	const editor = new Editor({
		extensions: schemaExtensions(),
		content: markdown,
		contentType: "markdown",
	});
	editors.push(editor);
	return editor;
}

afterEach(() => {
	for (const editor of editors.splice(0)) editor.destroy();
});

describe("tiptap markdown conventions", () => {
	it("parses variables and mentions into atomic nodes", () => {
		const editor = load(
			"เรียน {{customer_name}} cc [@สมชาย ใจดี](mention:u1) and [x](https://x.dev)",
		);
		const paragraph = editor.getJSON().content?.[0];
		expect(paragraph?.content).toEqual([
			{ type: "text", text: "เรียน " },
			{ type: "variable", attrs: { name: "customer_name" } },
			{ type: "text", text: " cc " },
			{
				type: "mention",
				attrs: { id: "u1", label: "สมชาย ใจดี", mentionSuggestionChar: "@" },
			},
			{ type: "text", text: " and " },
			expect.objectContaining({ type: "text", text: "x" }),
		]);
	});

	it("serializes the shared markdown and HTML forms", () => {
		const editor = load("Hi {{amount}} [@Suda Rakthai](mention:u2)");
		expect(editor.getMarkdown()).toBe(
			"Hi {{amount}} [@Suda Rakthai](mention:u2)",
		);
		expect(editor.getHTML()).toBe(
			'<p>Hi <span data-type="variable" data-name="amount">{{amount}}</span> <span data-type="mention" data-id="u2">@Suda Rakthai</span></p>',
		);
	});

	it("keeps a mark that wraps only an atom", () => {
		const source =
			"a **{{amount}}** b *[@Suda Rakthai](mention:u2)* c **bold {{x}} more**";
		const editor = load(source);
		const nodes = editor.getJSON().content?.[0]?.content ?? [];
		expect(nodes[1]).toMatchObject({
			type: "variable",
			marks: [{ type: "bold" }],
		});
		// Known upstream limit: an atom *inside* a longer bold run loses the mark.
		expect(editor.getMarkdown()).toBe(
			"a **{{amount}}** b *[@Suda Rakthai](mention:u2)* c **bold** {{x}} **more**",
		);
	});

	it("round-trips the sample document", () => {
		const first = load(sample).getMarkdown();
		const second = load(first).getMarkdown();
		// Second pass must be stable (the page's Round-trip button compares these).
		expect(second).toBe(first);
		expect(first).toContain("{{customer_name}}");
		expect(first).toContain("[@Suda Rakthai](mention:u2)");
		expect(first).toContain("**{{contract_id}}**");
	});
});
