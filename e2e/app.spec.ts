import { expect, test } from "@playwright/test";
import { gotoHydrated } from "./helpers";

test("overview lists all four editors and the comparison table", async ({
	page,
}) => {
	await gotoHydrated(page, "/");
	await expect(page.getByRole("heading", { level: 1 })).toContainText(
		"Plate vs BlockNote vs Lexical vs Tiptap",
	);
	await expect(page.getByTestId("comparison-table")).toBeVisible();
	for (const name of ["Plate", "BlockNote", "Lexical", "Tiptap"]) {
		await expect(
			page
				.getByRole("navigation", { name: "Main" })
				.getByRole("link", { name }),
		).toBeVisible();
	}
});

test("research page shows pros, cons and limitations per editor", async ({
	page,
}) => {
	await gotoHydrated(page, "/research");
	await expect(page.getByTestId("research-plate")).toContainText("Pros");
	await page.getByRole("tab", { name: "Lexical" }).click();
	await expect(page.getByTestId("research-lexical")).toContainText(
		"Limitations",
	);
});
