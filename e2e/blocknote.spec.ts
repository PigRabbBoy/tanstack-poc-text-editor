import { expect, type Page, test } from "@playwright/test";

const editor = (page: Page) => page.locator(".bn-editor[contenteditable=true]");

async function open(page: Page) {
	await page.goto("/blocknote");
	await expect(editor(page)).toBeVisible({ timeout: 60_000 });
	await expect(editor(page)).toContainText("ใบเสนอราคา");
	// The preview panel appears after the first onChange snapshot.
	await expect(page.getByRole("tab", { name: /Markdown/ })).toBeVisible();
}

/** Puts the caret in a fresh empty paragraph at the end of the document. */
async function caretAtEnd(page: Page) {
	await editor(page)
		.locator(".bn-block-content")
		.filter({ hasText: "ขอแสดงความนับถือ" })
		.click();
	await page.keyboard.press("End");
	await page.keyboard.press("Enter");
	await page.keyboard.press("Enter");
}

async function showMarkdown(page: Page) {
	await page.getByRole("tab", { name: /Markdown/ }).click();
	return page.getByTestId("preview-markdown");
}

test("renders the BlockNote editor with the sample, without console errors", async ({
	page,
}) => {
	const problems: string[] = [];
	page.on("console", (message) => {
		const text = message.text();
		// The shell loads web fonts; a blocked font request is not an editor error.
		if (message.type() === "error" && !text.includes("Failed to load resource"))
			problems.push(text);
		if (/hydrat/i.test(text)) problems.push(text);
	});
	page.on("pageerror", (error) => problems.push(error.message));
	await open(page);
	await expect(page.getByTestId("editor-skeleton")).toHaveCount(0);
	await expect(page.getByTestId("blocknote-fixed-toolbar")).toBeVisible();
	await page.waitForTimeout(500);
	expect(problems).toEqual([]);
});

test("typing updates the Markdown preview", async ({ page }) => {
	await open(page);
	await caretAtEnd(page);
	// keyboard.type inserts characters directly; it is not real Thai IME composition.
	await page.keyboard.type("Typed by Playwright สวัสดีครับ");
	await expect(await showMarkdown(page)).toContainText(
		"Typed by Playwright สวัสดีครับ",
	);
});

test("markdown shortcuts create blocks (including a ``` code block)", async ({
	page,
}) => {
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await open(page);
	await caretAtEnd(page);
	await page.keyboard.type("## Shortcut heading");
	await page.keyboard.press("Enter");
	await page.keyboard.type("[] shortcut task");
	await page.keyboard.press("Enter");
	await page.keyboard.press("Enter");
	await page.keyboard.type("```");
	await page.keyboard.press("Enter");
	await page.keyboard.type("shortcut code");
	const markdown = await showMarkdown(page);
	await expect(markdown).toContainText("## Shortcut heading");
	await expect(markdown).toContainText("[ ] shortcut task");
	await expect(markdown).toContainText("shortcut code");
	expect(errors).toEqual([]);
});

test("variables and mentions load from markdown and fill", async ({ page }) => {
	await open(page);
	await expect(
		editor(page).locator('[data-type="variable"][data-name="customer_name"]'),
	).not.toHaveCount(0);
	await expect(
		editor(page).locator('[data-type="mention"][data-id="u2"]'),
	).toHaveText("@Suda Rakthai");
	const markdown = await showMarkdown(page);
	await expect(markdown).toContainText("{{customer_name}}");
	await expect(markdown).toContainText("[@Suda Rakthai](mention:u2)");
	await page.getByRole("tab", { name: "Filled" }).click();
	await expect(page.getByTestId("preview-filled")).toContainText(
		"บริษัท ตัวอย่าง จำกัด",
	);
	await page.getByRole("tab", { name: /HTML/ }).click();
	await expect(page.getByTestId("preview-html")).toContainText(
		'<span data-type="mention" data-id="u1">@สมชาย ใจดี</span>',
	);
});

test("slash menu inserts a Variable via the variable picker", async ({
	page,
}) => {
	await open(page);
	const dueDate = editor(page).locator(
		'[data-type="variable"][data-name="due_date"]',
	);
	const before = await dueDate.count();
	await caretAtEnd(page);
	await page.keyboard.type("/");
	const menu = page.locator(".bn-suggestion-menu");
	await expect(menu).toBeVisible();
	await page.keyboard.type("variable");
	await expect(menu.getByText("Variable", { exact: true })).toBeVisible();
	await page.keyboard.press("Enter");
	// The Variable item opens the `{{` picker.
	await expect(menu.getByText("Due date")).toBeVisible();
	await page.keyboard.type("due");
	await page.keyboard.press("Enter");
	await expect(dueDate).toHaveCount(before + 1);
});

test("typing {{ and @ open the variable and mention pickers", async ({
	page,
}) => {
	await open(page);
	await caretAtEnd(page);
	await page.keyboard.type("Pay {{");
	const menu = page.locator(".bn-suggestion-menu");
	await expect(menu.getByText("Contract ID")).toBeVisible();
	await page.keyboard.type("contract");
	await page.keyboard.press("Enter");
	await page.keyboard.type("to @");
	await expect(menu.getByText("Benz Sirimongkon")).toBeVisible();
	await page.keyboard.type("Benz");
	await page.keyboard.press("Enter");
	await expect(
		editor(page).locator('[data-type="mention"][data-id="u3"]'),
	).toHaveCount(1);
	await expect(await showMarkdown(page)).toContainText(
		"Pay {{contract_id}} to [@Benz Sirimongkon](mention:u3)",
	);
});

test("round-trip reports a result", async ({ page }) => {
	await open(page);
	await page.getByTestId("round-trip").click();
	await expect(page.getByTestId("round-trip-result")).toBeVisible();
	await expect(editor(page)).toContainText("ใบเสนอราคา");
});

test("reset restores the sample", async ({ page }) => {
	await open(page);
	await caretAtEnd(page);
	await page.keyboard.type("Temporary text");
	await expect(await showMarkdown(page)).toContainText("Temporary text");
	await page.getByTestId("reset").click();
	await expect(editor(page)).toContainText("ใบเสนอราคา");
	await expect(editor(page)).not.toContainText("Temporary text");
});

test("Rendered tab uses a read-only BlockNote view", async ({ page }) => {
	await open(page);
	const rendered = page.getByTestId("preview-rendered");
	await expect(rendered.locator(".bn-editor")).toHaveAttribute(
		"contenteditable",
		"false",
	);
	await expect(
		rendered.locator('[data-type="variable"][data-name="amount"]'),
	).not.toHaveCount(0);
});
