import { describe, expect, it } from "vitest";
import { meta } from "./meta";

describe("plate tool inventory", () => {
	it("has unique names (they are React keys on the page)", () => {
		const names = meta.inventory.map((tool) => tool.name);
		expect(names.filter((name, i) => names.indexOf(name) !== i)).toEqual([]);
	});

	it("says where to find every included tool and why every excluded one is missing", () => {
		for (const tool of meta.inventory) {
			if (tool.status === "included")
				expect(tool.howTo, tool.name).toBeTruthy();
			else expect(tool.reason, tool.name).toBeTruthy();
		}
	});
});
