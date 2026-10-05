import { expect, type Page, test } from "@playwright/test";

const EDITOR = '[data-testid="editor-root"] [data-slate-editor="true"]';

/** Console noise that is not caused by the page (sandboxed font CDN, React DevTools hint). */
const IGNORED = [
	/Download the React DevTools/,
	/Failed to load resource/,
	/\[vite\]/,
];

async function openPlate(page: Page) {
	const problems: string[] = [];
	page.on("console", (message) => {
		const text = message.text();
		if (IGNORED.some((pattern) => pattern.test(text))) return;
		if (
			message.type() === "error" ||
			/hydrat|did not match/i.test(text) ||
			(message.type() === "warning" && /react|plate|slate/i.test(text))
		)
			problems.push(`[${message.type()}] ${text}`);
	});
	page.on("pageerror", (error) =>
		problems.push(`[pageerror] ${error.message}`),
	);
	await page.goto("/plate");
	const editor = page.locator(EDITOR);
	await expect(editor).toBeVisible({ timeout: 60_000 });
	await expect(editor).toContainText("ใบเสนอราคา");
	// The page publishes the first snapshot after load; wait for the preview.
	await expect(page.getByTestId("preview-rendered")).toBeVisible();
	return { editor, problems };
}

/** Puts the caret at the end of the (single-line) block that contains `text`. */
async function caretAtEndOf(page: Page, text: string) {
	await page.locator(EDITOR).getByText(text).first().click();
	await page.waitForTimeout(200);
	await page.keyboard.press("End");
	await page.waitForTimeout(100);
}

async function markdownPreview(page: Page) {
	await page.getByRole("tab", { name: /Markdown/ }).click();
	return page.getByTestId("preview-markdown");
}

test.describe("Plate editor page", () => {
	test("renders the editor with the sample and no console errors", async ({
		page,
	}) => {
		const { editor, problems } = await openPlate(page);
		await expect(page.getByTestId("editor-skeleton")).toHaveCount(0);
		await expect(editor).toHaveAttribute("contenteditable", "true");
		await expect(
			page.getByTestId("preview-rendered").getByTestId("plate-static"),
		).toContainText("ใบเสนอราคา");
		await page.waitForTimeout(1000);
		expect(problems).toEqual([]);
	});

	test("typing updates the Markdown preview", async ({ page }) => {
		await openPlate(page);
		await caretAtEndOf(page, "ขอแสดงความนับถือ,");
		await page.keyboard.type(" plate-e2e-typing");
		await expect(await markdownPreview(page)).toContainText(
			"ขอแสดงความนับถือ, plate-e2e-typing",
		);
	});

	test("Thai text typed with keyboard.type (not a real IME) reaches markdown", async ({
		page,
	}) => {
		await openPlate(page);
		await caretAtEndOf(page, "ขอแสดงความนับถือ,");
		await page.keyboard.type(" ทดสอบ น้ำ ผู้ใหญ่");
		await expect(await markdownPreview(page)).toContainText(
			"ขอแสดงความนับถือ, ทดสอบ น้ำ ผู้ใหญ่",
		);
	});

	test("variables are chips and the Filled tab fills them", async ({
		page,
	}) => {
		const { editor } = await openPlate(page);
		const chip = editor
			.locator('[data-type="variable"][data-name="customer_name"]')
			.first();
		await expect(chip).toBeVisible();
		await expect(chip).toHaveText("{{customer_name}}");
		await expect(chip).toHaveAttribute("contenteditable", "false");
		await page.getByRole("tab", { name: "Filled" }).click();
		await expect(page.getByTestId("preview-filled")).toContainText(
			"บริษัท ตัวอย่าง จำกัด",
		);
		await page.getByRole("tab", { name: /HTML/ }).click();
		await expect(page.getByTestId("preview-html")).toContainText(
			'data-type="variable" data-name="customer_name" style="position:relative">{{customer_name}}</span>',
		);
	});

	test("mentions load from markdown with their id", async ({ page }) => {
		const { editor } = await openPlate(page);
		const mention = editor.locator('[data-type="mention"][data-id="u2"]');
		await expect(mention).toHaveCount(1);
		await expect(mention).toContainText("@Suda Rakthai");
		await expect(await markdownPreview(page)).toContainText(
			"[@Suda Rakthai](mention:u2)",
		);
	});

	test("slash menu inserts a Variable via the picker", async ({ page }) => {
		const { editor } = await openPlate(page);
		await caretAtEndOf(page, "ขอแสดงความนับถือ,");
		await page.keyboard.press("Enter");
		await page.keyboard.type("/");
		const menu = page.getByRole("listbox");
		await expect(menu).toBeVisible();
		await expect(menu.getByRole("option", { name: /Variable/ })).toBeVisible();
		await page.keyboard.type("Variable");
		await page.keyboard.press("Enter");
		await expect(page.getByRole("option", { name: /due_date/ })).toBeVisible();
		await page.keyboard.type("due");
		await page.keyboard.press("Enter");
		await expect(
			editor.locator('[data-type="variable"][data-name="due_date"]'),
		).toHaveCount(2);
	});

	test("typing {{ opens the variable picker", async ({ page }) => {
		const { editor } = await openPlate(page);
		await caretAtEndOf(page, "ขอแสดงความนับถือ,");
		await page.keyboard.type(" {{");
		await expect(
			page.getByRole("option", { name: /contract_id/ }),
		).toBeVisible();
		await page.keyboard.type("contract");
		await page.keyboard.press("Enter");
		await expect(
			editor.locator('[data-type="variable"][data-name="contract_id"]'),
		).toHaveCount(2);
		await expect(await markdownPreview(page)).toContainText(
			"ขอแสดงความนับถือ, {{contract_id}}",
		);
	});

	test("typing @ inserts a mention from USERS", async ({ page }) => {
		const { editor } = await openPlate(page);
		await caretAtEndOf(page, "ขอแสดงความนับถือ,");
		await page.keyboard.type(" @");
		await page.keyboard.type("Benz");
		await expect(
			page.getByRole("option", { name: /Benz Sirimongkon/ }),
		).toBeVisible();
		await page.keyboard.press("Enter");
		await expect(
			editor.locator('[data-type="mention"][data-id="u3"]'),
		).toHaveCount(1);
		await expect(await markdownPreview(page)).toContainText(
			"[@Benz Sirimongkon](mention:u3)",
		);
	});

	test("round-trip reports a result", async ({ page }) => {
		await openPlate(page);
		await page.waitForTimeout(500);
		await page.getByTestId("round-trip").click();
		await expect(page.getByTestId("round-trip-result")).toBeVisible({
			timeout: 15_000,
		});
		await expect(page.locator(EDITOR)).toContainText("ใบเสนอราคา");
	});

	test("reset restores the sample", async ({ page }) => {
		const { editor } = await openPlate(page);
		await caretAtEndOf(page, "ขอแสดงความนับถือ,");
		await page.keyboard.type(" plate-e2e-reset");
		await expect(editor).toContainText("plate-e2e-reset");
		await page.getByTestId("reset").click();
		await expect(page.locator(EDITOR)).toContainText("ใบเสนอราคา");
		await expect(page.locator(EDITOR)).not.toContainText("plate-e2e-reset");
		await expect(await markdownPreview(page)).not.toContainText(
			"plate-e2e-reset",
		);
	});
});
