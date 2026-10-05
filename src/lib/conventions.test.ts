import { describe, expect, it } from "vitest";
import {
	fillVariablesInHtml,
	fillVariablesInMarkdown,
	mentionHtml,
	mentionMarkdown,
	tokenizeInline,
	variableHtml,
	variableMarkdown,
} from "./conventions";

describe("tokenizeInline", () => {
	it("splits variables and mentions out of text", () => {
		expect(
			tokenizeInline("เรียน {{customer_name}} cc [@สมชาย ใจดี](mention:u1)."),
		).toEqual([
			{ type: "text", text: "เรียน " },
			{ type: "variable", name: "customer_name" },
			{ type: "text", text: " cc " },
			{ type: "mention", label: "สมชาย ใจดี", id: "u1" },
			{ type: "text", text: "." },
		]);
	});

	it("ignores malformed variables", () => {
		expect(tokenizeInline("{{Not Valid}} {{}}")).toEqual([
			{ type: "text", text: "{{Not Valid}} {{}}" },
		]);
	});
});

describe("round-trip helpers", () => {
	it("builds the shared markdown forms", () => {
		expect(variableMarkdown("amount")).toBe("{{amount}}");
		expect(mentionMarkdown("u2", "Suda Rakthai")).toBe(
			"[@Suda Rakthai](mention:u2)",
		);
	});

	it("escapes html in chips", () => {
		expect(mentionHtml("u9", "<b>")).toBe(
			'<span data-type="mention" data-id="u9">@&lt;b&gt;</span>',
		);
	});
});

describe("fillVariables", () => {
	const values = { customer_name: "ACME", amount: "฿1" };

	it("fills chips and bare tokens in html", () => {
		const html = `<p>${variableHtml("customer_name")} pays {{amount}} {{unknown}}</p>`;
		expect(fillVariablesInHtml(html, values)).toBe(
			'<p><mark data-filled="customer_name">ACME</mark> pays <mark data-filled="amount">฿1</mark> {{unknown}}</p>',
		);
	});

	it("fills markdown and keeps unknown names", () => {
		expect(fillVariablesInMarkdown("{{customer_name}} / {{x}}", values)).toBe(
			"ACME / {{x}}",
		);
	});
});
