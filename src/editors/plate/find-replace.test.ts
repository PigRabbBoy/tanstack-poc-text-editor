import { createSlateEditor, type Value } from "platejs";
import { describe, expect, it } from "vitest";
import { findRanges, replaceAll } from "./find-replace";

const value = (): Value => [
	{ type: "p", children: [{ text: "Boonmee Lab and boonmee again" }] },
	{
		type: "p",
		children: [
			{ text: "Plain " },
			{ text: "Boonmee", bold: true },
			{ text: " bold" },
		],
	},
	{ type: "p", children: [{ text: "nothing here" }] },
];

describe("find & replace", () => {
	it("finds every case-insensitive match, per text leaf", () => {
		const editor = createSlateEditor({ value: value() });
		expect(findRanges(editor, "boonmee")).toHaveLength(3);
		expect(findRanges(editor, "")).toEqual([]);
		expect(findRanges(editor, "absent")).toEqual([]);
	});

	it("replaces all matches, keeping marks and other text", () => {
		const editor = createSlateEditor({ value: value() });
		expect(replaceAll(editor, "Boonmee", "BML")).toBe(3);
		expect(editor.children).toEqual([
			{ type: "p", children: [{ text: "BML Lab and BML again" }] },
			{
				type: "p",
				children: [
					{ text: "Plain " },
					{ text: "BML", bold: true },
					{ text: " bold" },
				],
			},
			{ type: "p", children: [{ text: "nothing here" }] },
		]);
		expect(findRanges(editor, "boonmee")).toHaveLength(0);
	});
});
