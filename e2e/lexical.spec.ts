import { expect, type Page, test } from "@playwright/test";

const editor = (page: Page) =>
	page.locator('[data-testid="lexical-editor"] [contenteditable="true"]');

/** Collects console errors / hydration warnings; network failures for third-party
 * assets (e.g. Google Fonts behind a proxy) are environment noise and ignored. */
function watchConsole(page: Page) {
	const problems: string[] = [];
	page.on("console", (message) => {
		const text = message.text();
		if (/hydrat/i.test(text)) problems.push(`[${message.type()}] ${text}`);
		else if (
			message.type() === "error" &&
			!text.startsWith("Failed to load resource")
		)
			problems.push(text);
	});
	page.on("pageerror", (error) => problems.push(error.message));
	return problems;
}

async function open(page: Page) {
	await page.goto("/lexical");
	await expect(editor(page)).toContainText("ใบเสนอราคา", { timeout: 60_000 });
	// The preview fills in once the first debounced snapshot lands.
	await expect(page.getByTestId("preview-rendered")).toContainText(
		"ใบเสนอราคา",
	);
}

async function caretAtEnd(page: Page) {
	await editor(page).click();
	await page.keyboard.press("ControlOrMeta+End");
}

test.describe("Lexical editor", () => {
	test("renders the sample in the editor and the read-only preview", async ({
		page,
	}) => {
		await open(page);
		await expect(page.getByTestId("editor-skeleton")).toHaveCount(0);
		await expect(
			page.getByTestId("lexical-rendered").locator('[data-type="variable"]'),
		).not.toHaveCount(0);
	});

	test("loads without console errors or hydration warnings", async ({
		page,
	}) => {
		const problems = watchConsole(page);
		await open(page);
		await page.waitForTimeout(500);
		expect(problems).toEqual([]);
	});

	test("typing updates the Markdown preview", async ({ page }) => {
		await open(page);
		await caretAtEnd(page);
		await page.keyboard.press("Enter");
		await page.keyboard.type("Typed by Playwright ทดสอบ");
		await page.getByRole("tab", { name: /Markdown/ }).click();
		await expect(page.getByTestId("preview-markdown")).toContainText(
			"Typed by Playwright ทดสอบ",
		);
	});

	test("variable chip and filled preview", async ({ page }) => {
		await open(page);
		await expect(
			editor(page).locator('[data-type="variable"][data-name="customer_name"]'),
		).not.toHaveCount(0);
		await page.getByRole("tab", { name: "Filled" }).click();
		await expect(page.getByTestId("preview-filled")).toContainText(
			"บริษัท ตัวอย่าง จำกัด",
		);
		await page.getByRole("tab", { name: /HTML/ }).click();
		await expect(page.getByTestId("preview-html")).toContainText(
			'<span data-type="variable" data-name="customer_name">{{customer_name}}</span>',
		);
	});

	test("mention for u2 and @ typeahead", async ({ page }) => {
		await open(page);
		const suda = editor(page).locator('[data-type="mention"][data-id="u2"]');
		await expect(suda).toHaveCount(1);
		await expect(suda).toHaveText("@Suda Rakthai");
		await caretAtEnd(page);
		await page.keyboard.press("Enter");
		await page.keyboard.type("@Suda");
		await expect(
			page.getByRole("option", { name: /Suda Rakthai/ }),
		).toBeVisible();
		await page.keyboard.press("Enter");
		await expect(suda).toHaveCount(2);
		await page.getByRole("tab", { name: /Markdown/ }).click();
		await expect(page.getByTestId("preview-markdown")).toContainText(
			"[@Suda Rakthai](mention:u2)",
		);
	});

	test("slash menu inserts a Variable", async ({ page }) => {
		await open(page);
		const dueDate = editor(page).locator(
			'[data-type="variable"][data-name="due_date"]',
		);
		await expect(dueDate).toHaveCount(1);
		await caretAtEnd(page);
		await page.keyboard.press("Enter");
		await page.keyboard.type("/");
		await expect(page.getByRole("option", { name: "Paragraph" })).toBeVisible();
		await page.keyboard.type("due");
		await expect(
			page.getByRole("option", { name: "Variable · Due date" }),
		).toBeVisible();
		await page.keyboard.press("Enter");
		await expect(dueDate).toHaveCount(2);
	});

	test("typing {{ opens the variable picker", async ({ page }) => {
		await open(page);
		const amount = editor(page).locator(
			'[data-type="variable"][data-name="amount"]',
		);
		const before = await amount.count();
		await caretAtEnd(page);
		await page.keyboard.press("Enter");
		await page.keyboard.type("{{amo");
		await expect(page.getByTestId("variable-menu")).toBeVisible();
		await page.keyboard.press("Enter");
		await expect(amount).toHaveCount(before + 1);
	});

	test("round-trip reports a result", async ({ page }) => {
		await open(page);
		await page.getByTestId("round-trip").click();
		await expect(page.getByTestId("round-trip-result")).toBeVisible({
			timeout: 15_000,
		});
	});

	test("reset restores the sample", async ({ page }) => {
		await open(page);
		await editor(page).click();
		await page.keyboard.press("ControlOrMeta+a");
		await page.keyboard.press("Backspace");
		await page.keyboard.type("scratch");
		await expect(editor(page)).not.toContainText("ใบเสนอราคา");
		await page.getByTestId("reset").click();
		await expect(editor(page)).toContainText("ใบเสนอราคา");
		await expect(editor(page)).not.toContainText("scratch");
	});
});
