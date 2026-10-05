import { deserializeCsv } from "@platejs/csv";
import { createSlateEditor } from "platejs";
import { describe, expect, it } from "vitest";
import { CsvKit } from "./components/editor/plugins/csv-kit";

const editor = createSlateEditor({ plugins: CsvKit });

// Paste only becomes a table when every line splits into the same number of
// columns (>= 2); "a, b\nc, d" is a table, a letter with one comma-free line is not.
describe("CSV paste", () => {
	it("turns consistent comma-separated rows into a table", () => {
		const nodes = deserializeCsv(editor, {
			data: "Item,Qty\nDiscovery,1\nBuild,2",
		});
		const table = nodes?.find((node) => node.type === "table");
		expect(table?.children).toHaveLength(3);
	});

	it("leaves prose as text when any line has a different number of commas", () => {
		const prose = [
			"เรียนลูกค้า, ขอบคุณที่ใช้บริการ",
			"ราคานี้รวม VAT, ยืนราคา 30 วัน",
			"ชำระเงินภายใน 7 วัน, ผ่านโอน",
			"หากมีคำถาม, ติดต่อทีมงาน",
			"ขอแสดงความนับถือ",
		].join("\n");
		expect(deserializeCsv(editor, { data: prose })).toBeUndefined();
	});
});
