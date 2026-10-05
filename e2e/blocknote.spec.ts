import { expect, type Page, test } from "@playwright/test";

const editor = (page: Page) => page.locator(".bn-editor[contenteditable=true]");

// The editor chunk is large in dev (BlockNote + Shiki + KaTeX + Mermaid), so the first
// load of a worker can take longer than Playwright's 30 s default.
test.describe.configure({ timeout: 90_000 });

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

/** Inserts a block from the slash menu in a fresh paragraph at the end. */
async function slash(page: Page, title: string) {
	await caretAtEnd(page);
	await page.keyboard.type(`/${title}`);
	const menu = page.locator(".bn-suggestion-menu");
	await expect(menu.getByText(title, { exact: true })).toBeVisible();
	await page.keyboard.press("Enter");
}

test("slash menu adds page break, columns, equation, diagram and alert blocks", async ({
	page,
}) => {
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await open(page);
	await slash(page, "Page Break");
	await expect(
		editor(page).locator('[data-content-type="pageBreak"]'),
	).toHaveCount(1);
	await slash(page, "Block Equation");
	await page.keyboard.type("a^2+b^2=c^2");
	await expect(
		editor(page).locator('[data-content-type="mathBlock"] math'),
	).toBeVisible();
	await page.keyboard.press("Escape");
	await slash(page, "Diagram");
	await expect(
		editor(page).locator('[data-content-type="diagram"] svg').first(),
	).toBeVisible({ timeout: 30_000 });
	await page.keyboard.press("Escape");
	await slash(page, "Alert");
	await page.keyboard.type("Check the totals");
	const alert = editor(page).locator('[data-content-type="alert"]');
	await expect(alert).toContainText("Check the totals");
	await alert.getByTestId("blocknote-alert-type").click();
	await expect(alert.locator("[data-alert-type]")).toHaveAttribute(
		"data-alert-type",
		"error",
	);
	await slash(page, "Two Columns");
	await expect(
		editor(page).locator('[data-node-type="columnList"]'),
	).toHaveCount(1);
	const markdown = await showMarkdown(page);
	await expect(markdown).toContainText("$$");
	await expect(markdown).toContainText("```mermaid");
	expect(errors).toEqual([]);
});

test("code blocks are highlighted and get a supported language", async ({
	page,
}) => {
	await open(page);
	const code = editor(page).locator('[data-content-type="codeBlock"]');
	// The sample's ```ts fence is normalised to the "typescript" id the picker lists.
	await expect(code.locator("select")).toHaveValue("typescript");
	await expect(code.locator("code span.shiki").first()).toBeVisible();
	await code.locator("select").selectOption("python");
	await expect(await showMarkdown(page)).toContainText("```python");
});

test("comments: add a thread and see it in the sidebar", async ({ page }) => {
	await open(page);
	await editor(page).locator("h2").filter({ hasText: "Summary" }).dblclick();
	await page.getByRole("button", { name: "Add comment" }).last().click();
	await page.keyboard.type("Please double-check this section");
	await page.keyboard.press("Enter");
	await expect(editor(page).locator(".bn-thread-mark")).toHaveCount(1);
	await page.getByTestId("blocknote-comments-panel").click();
	const sidebar = page.getByTestId("blocknote-threads-sidebar");
	await expect(sidebar).toContainText("Please double-check this section");
	await expect(sidebar).toContainText("Benz Sirimongkon");
});

test("version history saves a snapshot", async ({ page }) => {
	await open(page);
	await page.getByTestId("blocknote-history-panel").click();
	const sidebar = page.getByTestId("blocknote-versioning-sidebar");
	const snapshots = sidebar.locator(".bn-snapshot");
	await expect(snapshots.first()).toBeVisible();
	const before = await snapshots.count();
	// "Save current version" asks for an optional name with window.prompt.
	page.once("dialog", (dialog) => dialog.accept("Before legal review"));
	await sidebar
		.locator(".bn-versioning-sidebar-header-title button")
		.first()
		.click();
	await expect(snapshots).toHaveCount(before + 1);
	await expect(sidebar.locator("input.bn-snapshot-name")).toHaveValue(
		"Before legal review",
	);
});

test("Export menu downloads every format", async ({ page }) => {
	test.setTimeout(300_000);
	await open(page);
	const formats = {
		html: "blocknote-export.html",
		"full-html": "blocknote-export-blocknote.html",
		typst: "blocknote-export.typ",
		docx: "blocknote-export.docx",
		odt: "blocknote-export.odt",
		email: "blocknote-export-email.html",
		"react-pdf": "blocknote-export-react-pdf.pdf",
		pdf: "blocknote-export.pdf",
	};
	const trigger = page.getByTestId("blocknote-export-menu");
	for (const [id, filename] of Object.entries(formats)) {
		// The trigger is disabled while an export runs and the menu closes after a pick.
		await expect(trigger).toBeEnabled({ timeout: 120_000 });
		await expect(page.getByRole("menu")).toBeHidden();
		await trigger.click();
		const download = page.waitForEvent("download", { timeout: 120_000 });
		await page.getByTestId(`blocknote-export-${id}`).click();
		expect((await download).suggestedFilename()).toBe(filename);
	}
	// The sample (Thai via the Anuphan fallback font) passes Typst's PDF/UA-1 checks.
	await expect(page.getByText("PDF/UA-1 declared")).toBeVisible();
});

test("Import replaces the document from HTML, restoring the Alert block and chips", async ({
	page,
}) => {
	await open(page);
	await page.getByTestId("blocknote-import-menu").click();
	await page.getByTestId("blocknote-import-replace-html").click();
	await page
		.getByTestId("blocknote-import-text")
		.fill(
			'<h2>Imported</h2><div role="note" data-alert-type="info">Due <span data-type="variable" data-name="due_date">{{due_date}}</span></div>',
		);
	await page.getByTestId("blocknote-import-apply").click();
	await expect(editor(page).locator("h2")).toHaveText("Imported");
	await expect(
		editor(page).locator(
			'[data-content-type="alert"] [data-alert-type="info"]',
		),
	).toContainText("Due");
	await expect(
		editor(page).locator('[data-type="variable"][data-name="due_date"]'),
	).toHaveCount(1);
});

test("UI language switch re-labels BlockNote's own UI", async ({ page }) => {
	await open(page);
	const toolbar = page.getByTestId("blocknote-fixed-toolbar");
	await expect(toolbar.getByRole("button", { name: "Bold" })).toBeVisible();
	await page.getByTestId("blocknote-language").click();
	await page.getByTestId("blocknote-language-de").click();
	await expect(page.getByTestId("blocknote-language")).toContainText("Deutsch");
	await expect(toolbar.getByRole("button", { name: "Fett" })).toBeVisible();
	// The document is carried over to the re-created editor.
	await expect(editor(page)).toContainText("ใบเสนอราคา");
});

test("Font style and read-only toggle", async ({ page }) => {
	await open(page);
	await editor(page).locator("h2").filter({ hasText: "Summary" }).dblclick();
	await page
		.getByTestId("blocknote-fixed-toolbar")
		.getByRole("combobox")
		.filter({ hasText: "Default font" })
		.click();
	await page.getByRole("option", { name: "Poppins" }).click();
	await expect(editor(page).locator('h2 span[style*="Poppins"]')).toHaveText(
		"Summary",
	);

	await page.getByTestId("blocknote-readonly").click();
	await expect(
		page.getByTestId("blocknote-editor").locator(".bn-editor"),
	).toHaveAttribute("contenteditable", "false");
});

test("emoji picker opens on ':' and inserts an emoji", async ({ page }) => {
	await open(page);
	await caretAtEnd(page);
	await page.keyboard.type(":smil");
	const grid = page.locator(".bn-grid-suggestion-menu");
	await expect(grid).toBeVisible();
	const emoji = await grid
		.locator(".bn-grid-suggestion-menu-item")
		.first()
		.innerText();
	await page.keyboard.press("Enter");
	await expect(grid).toBeHidden();
	await expect(await showMarkdown(page)).toContainText(emoji.trim());
});
