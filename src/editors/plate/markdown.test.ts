import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { TElement, Value } from "platejs";
import { describe, expect, it, vi } from "vitest";
import { markdownToValue, valueToHtml, valueToMarkdown } from "./snapshot";

// @platejs/math's dist imports `katex.min.css`, which Node cannot load when
// vitest externalizes the package; the math nodes are irrelevant here.
vi.mock("@platejs/math", async () => {
	const { createSlatePlugin } = await import("platejs");
	return {
		BaseEquationPlugin: createSlatePlugin({
			key: "equation",
			node: { isElement: true, isVoid: true },
		}),
		BaseInlineEquationPlugin: createSlatePlugin({
			key: "inline_equation",
			node: { isElement: true, isInline: true, isVoid: true },
		}),
		getEquationHtml: () => "",
	};
});

const sample = readFileSync(resolve(__dirname, "../../data/sample.md"), "utf8");

function findAll(value: Value, type: string): TElement[] {
	const found: TElement[] = [];
	const walk = (nodes: unknown[]) => {
		for (const node of nodes as TElement[]) {
			if (node.type === type) found.push(node);
			if (Array.isArray(node.children)) walk(node.children);
		}
	};
	walk(value);
	return found;
}

describe("plate markdown conventions", () => {
	it("parses {{variables}} into atomic variable nodes", () => {
		const value = markdownToValue(
			"Dear {{customer_name}}, total **{{amount}}**",
		);
		const variables = findAll(value, "variable");
		expect(variables.map((node) => node.name)).toEqual([
			"customer_name",
			"amount",
		]);
		expect(valueToMarkdown(value).trim()).toBe(
			"Dear {{customer_name}}, total **{{amount}}**",
		);
	});

	it("parses mention links and serializes them back", () => {
		const markdown =
			"Contact [@Suda Rakthai](mention:u2) or [@สมชาย ใจดี](mention:u1).";
		const value = markdownToValue(markdown);
		const mentions = findAll(value, "mention");
		expect(mentions.map((node) => [node.key, node.value])).toEqual([
			["u2", "Suda Rakthai"],
			["u1", "สมชาย ใจดี"],
		]);
		expect(valueToMarkdown(value).trim()).toBe(markdown);
	});

	it("exports the shared HTML data attributes", async () => {
		const html = await valueToHtml(
			markdownToValue("Hi {{customer_name}} from [@Suda Rakthai](mention:u2)"),
		);
		expect(html).toMatch(
			/<span[^>]*data-type="variable"[^>]*data-name="customer_name"[^>]*>\{\{customer_name\}\}<\/span>/,
		);
		expect(html).toMatch(
			/<span[^>]*data-type="mention"[^>]*data-id="u2"[^>]*>@Suda Rakthai<\/span>/,
		);
	});

	it("round-trips the sample document idempotently", () => {
		const first = valueToMarkdown(markdownToValue(sample));
		const second = valueToMarkdown(markdownToValue(first));
		expect(second).toBe(first);
		expect(first).toContain("{{customer_name}}");
		expect(first).toContain("[@Suda Rakthai](mention:u2)");
	});
});
