import { buildEditorFromExtensions } from "@lexical/extension";
import { $generateHtmlFromNodes } from "@lexical/html";
import {
	MdastCommonMarkExtension,
	MdastExtension,
	MdastGfmExtension,
} from "@lexical/mdast";
import { ReactProviderExtension } from "@lexical/react/ReactProviderExtension";
import { defineExtension, type LexicalEditor } from "lexical";
import { describe, expect, it } from "vitest";
import sample from "@/data/sample.md?raw";
import { CONTENT_EXTENSIONS } from "./extensions";
import { $exportMarkdown, $importMarkdown } from "./markdown";
import { exportMdastMarkdown, MdastConventionsExtension } from "./mdast";

function load(markdown: string): LexicalEditor {
	const editor = buildEditorFromExtensions(
		defineExtension({
			name: "@poc/lexical/test",
			dependencies: [ReactProviderExtension, ...CONTENT_EXTENSIONS],
		}),
	);
	editor.update(() => $importMarkdown(markdown), { discrete: true });
	return editor;
}

function exportMarkdown(editor: LexicalEditor): string {
	return editor.getEditorState().read(() => $exportMarkdown());
}

describe("lexical markdown conventions", () => {
	it("parses variables and mentions into nodes and exports them back", () => {
		const editor = load(
			"Hi {{customer_name}}, ping [@Suda Rakthai](mention:u2) or [docs](https://x.dev). **{{amount}}**",
		);
		const json = JSON.stringify(editor.getEditorState().toJSON());
		expect(json).toContain('"type":"variable"');
		expect(json).toContain('"mentionId":"u2"');
		expect(exportMarkdown(editor)).toBe(
			"Hi {{customer_name}}, ping [@Suda Rakthai](mention:u2) or [docs](https://x.dev). **{{amount}}**",
		);
	});

	it("exports the shared HTML attributes", () => {
		const editor = load("{{due_date}} [@สมชาย ใจดี](mention:u1)");
		const html = editor.read(() => $generateHtmlFromNodes(editor, null));
		expect(html).toContain(
			'<span data-type="variable" data-name="due_date">{{due_date}}</span>',
		);
		expect(html).toContain(
			'<span data-type="mention" data-id="u1">@สมชาย ใจดี</span>',
		);
	});

	it("round-trips the sample idempotently", () => {
		const first = exportMarkdown(load(sample));
		const second = exportMarkdown(load(first));
		expect(second).toBe(first);
	});

	it("round-trips page breaks as an HTML comment", () => {
		const markdown = "Before\n\n<!-- pagebreak -->\n\nAfter";
		const editor = load(markdown);
		expect(JSON.stringify(editor.getEditorState().toJSON())).toContain(
			'"type":"page-break"',
		);
		expect(exportMarkdown(editor)).toBe(markdown);
	});

	it("exports the conventions through @lexical/mdast too", () => {
		const editor = buildEditorFromExtensions(
			defineExtension({
				name: "@poc/lexical/test-mdast",
				dependencies: [
					ReactProviderExtension,
					...CONTENT_EXTENSIONS,
					MdastExtension,
					MdastCommonMarkExtension,
					MdastGfmExtension,
					MdastConventionsExtension,
				],
			}),
		);
		editor.update(
			() =>
				$importMarkdown(
					"Contract **{{contract_id}}** for [@Suda Rakthai](mention:u2).",
				),
			{ discrete: true },
		);
		expect(exportMdastMarkdown(editor).trim()).toBe(
			"Contract **{{contract_id}}** for [@Suda Rakthai](mention:u2).",
		);
	});
});
