import { expect, type Page, test } from "@playwright/test";

const content = (page: Page) => page.getByTestId("tiptap-content");

/** Each test gets a fresh browser context, so localStorage starts empty (sample doc). */
async function openFresh(page: Page) {
	await page.goto("/tiptap");
	await expect(content(page)).toContainText("ใบเสนอราคา", { timeout: 30_000 });
	await expect(page.getByTestId("preview-rendered")).toBeVisible();
}

/** Places the caret at the very end of the document (after "{{sales_rep}}"). */
async function caretAtEnd(page: Page) {
	await content(page).locator("p").last().click();
	await page.keyboard.press("Control+End");
}

test.describe("Tiptap editor", () => {
	test("renders the sample without console errors or hydration warnings", async ({
		page,
	}) => {
		const problems: string[] = [];
		page.on("console", (message) => {
			const text = message.text();
			// Web fonts can fail behind a sandbox proxy; that is not the editor's fault.
			const isFont = /fonts\.(googleapis|gstatic)\.com/.test(
				message.location().url,
			);
			if (message.type() === "error" && !isFont) problems.push(text);
			if (/hydrat/i.test(text)) problems.push(text);
		});
		page.on("pageerror", (error) => problems.push(error.message));

		await openFresh(page);
		await expect(page.getByTestId("editor-skeleton")).toHaveCount(0);
		await expect(page.getByTestId("tiptap-toolbar")).toBeVisible();
		await expect(page.getByTestId("tiptap-rendered")).toContainText(
			"ใบเสนอราคา",
		);
		await page.waitForTimeout(500);
		expect(
			problems.filter((text) => !/Failed to load resource/.test(text)),
		).toEqual([]);
	});

	test("typing updates the markdown preview", async ({ page }) => {
		await openFresh(page);
		await caretAtEnd(page);
		await page.keyboard.press("Enter");
		await page.keyboard.type("Typed by Playwright สวัสดี");
		await page.getByRole("tab", { name: /Markdown/ }).click();
		await expect(page.getByTestId("preview-markdown")).toContainText(
			"Typed by Playwright สวัสดี",
		);
	});

	test("variable chips, mentions and the filled preview", async ({ page }) => {
		await openFresh(page);
		await expect(
			content(page).locator(
				'[data-type="variable"][data-name="customer_name"]',
			),
		).not.toHaveCount(0);
		await expect(
			content(page).locator('[data-type="mention"][data-id="u2"]'),
		).toHaveText("@Suda Rakthai");
		await page.getByRole("tab", { name: "Filled" }).click();
		await expect(page.getByTestId("preview-filled")).toContainText(
			"บริษัท ตัวอย่าง จำกัด",
		);
		await page.getByRole("tab", { name: /HTML/ }).click();
		await expect(page.getByTestId("preview-html")).toContainText(
			'<span data-type="mention" data-id="u2">@Suda Rakthai</span>',
		);
	});

	test("slash menu inserts a variable via the {{ picker", async ({ page }) => {
		await openFresh(page);
		await caretAtEnd(page);
		await page.keyboard.press("Enter");
		await page.keyboard.type("/");
		const menu = page.getByTestId("tiptap-suggestion");
		await expect(menu).toBeVisible();
		await page.keyboard.type("variab");
		await expect(menu.getByText("Variable", { exact: true })).toBeVisible();
		await page.keyboard.press("Enter");
		// The slash item re-types `{{`, which opens the variable picker.
		await expect(menu).toContainText("Contract ID");
		await page.keyboard.type("contract");
		await page.keyboard.press("Enter");
		await expect(menu).toHaveCount(0);
		await expect(
			content(page).locator('[data-type="variable"][data-name="contract_id"]'),
		).toHaveCount(2);
		await page.getByRole("tab", { name: /Markdown/ }).click();
		await expect(page.getByTestId("preview-markdown")).toContainText(
			"{{sales_rep}}\n\n{{contract_id}}",
		);
	});

	test("@ opens the people picker and inserts a mention", async ({ page }) => {
		await openFresh(page);
		await caretAtEnd(page);
		await page.keyboard.type(" cc @Ben");
		const menu = page.getByTestId("tiptap-suggestion");
		await expect(menu).toContainText("Benz Sirimongkon");
		await page.keyboard.press("Enter");
		await expect(
			content(page).locator('[data-type="mention"][data-id="u3"]'),
		).toHaveText("@Benz Sirimongkon");
	});

	test("markdown shortcuts and the {{name}} input rule", async ({ page }) => {
		await openFresh(page);
		await caretAtEnd(page);
		await page.keyboard.press("Enter");
		await page.keyboard.type("## Shortcut heading");
		await expect(
			content(page).locator("h2", { hasText: "Shortcut heading" }),
		).toBeVisible();
		await page.keyboard.press("Enter");
		await page.keyboard.type("Due {{due_date}} ok");
		await expect(
			content(page).locator('[data-type="variable"][data-name="due_date"]'),
		).toHaveCount(2);
	});

	test("image upload inlines small files and rejects files over 1 MB", async ({
		page,
	}) => {
		await openFresh(page);
		await caretAtEnd(page);
		const png = Buffer.from(
			"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
			"base64",
		);
		const input = page.locator(
			'[data-testid="tiptap-editor"] input[type="file"]',
		);
		await input.setInputFiles({
			name: "dot.png",
			mimeType: "image/png",
			buffer: png,
		});
		await expect(
			content(page).locator('img[src^="data:image/png;base64"]'),
		).toHaveCount(1);
		await input.setInputFiles({
			name: "big.png",
			mimeType: "image/png",
			buffer: Buffer.alloc(1024 * 1024 + 10),
		});
		await expect(page.getByText(/limit is 1 MB/)).toBeVisible();
	});

	test("round-trip reports a result and reset restores the sample", async ({
		page,
	}) => {
		await openFresh(page);
		await page.getByTestId("round-trip").click();
		await expect(page.getByTestId("round-trip-result")).toBeVisible();
		await expect(content(page)).toContainText("ใบเสนอราคา");

		await content(page).locator("h1").click();
		await page.keyboard.press("Control+a");
		await page.keyboard.press("Delete");
		await expect(content(page)).not.toContainText("ใบเสนอราคา");
		await page.getByTestId("reset").click();
		await expect(content(page)).toContainText("ใบเสนอราคา");
	});
});
