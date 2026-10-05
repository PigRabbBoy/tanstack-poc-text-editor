import { expect, type Page, test } from "@playwright/test";

/** The main ContentEditable (sticky notes and lab demos add other editors). */
const editor = (page: Page) => page.getByTestId("lexical-content");

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
	// Click the last paragraph (not the middle of the document) so the caret is
	// already near the end before Ctrl/Cmd+End.
	await editor(page).locator("p").last().click();
	await page.keyboard.press("ControlOrMeta+End");
}

/** The current document as Lexical JSON (EditorRefPlugin exposes the editor). */
function documentJson(page: Page) {
	return page.evaluate(() =>
		JSON.stringify(
			(
				window as unknown as {
					__lexicalPocEditor: { getEditorState(): { toJSON(): unknown } };
				}
			).__lexicalPocEditor
				.getEditorState()
				.toJSON(),
		),
	);
}

async function openLab(page: Page) {
	await page.getByTestId("lexical-lab").locator("summary").click();
	await expect(page.getByTestId("lab-settings")).toBeVisible();
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
		// SelectBlockExtension: the first Ctrl/Cmd+A selects the block, the second all.
		await page.keyboard.press("ControlOrMeta+a");
		await page.keyboard.press("ControlOrMeta+a");
		await page.keyboard.press("Backspace");
		await page.keyboard.type("scratch");
		await expect(editor(page)).not.toContainText("ใบเสนอราคา");
		await page.getByTestId("reset").click();
		await expect(editor(page)).toContainText("ใบเสนอราคา");
		await expect(editor(page)).not.toContainText("scratch");
	});
});

test.describe("Lexical tools", () => {
	test("hashtags and keywords become text entities", async ({ page }) => {
		await open(page);
		await caretAtEnd(page);
		await page.keyboard.press("Enter");
		await page.keyboard.type("Launch #release and congrats team ");
		await expect(editor(page).locator(".editor-keyword")).toHaveText(
			"congrats",
		);
		const json = await documentJson(page);
		expect(json).toContain('"type":"hashtag"');
		expect(json).toContain('"text":"#release"');
	});

	test("page break inserts a node and round-trips through markdown", async ({
		page,
	}) => {
		await open(page);
		await caretAtEnd(page);
		await page.getByTestId("insert-page-break").click();
		await expect(
			editor(page).locator("hr[data-lexical-page-break]"),
		).toHaveCount(1);
		await page.getByRole("tab", { name: /Markdown/ }).click();
		await expect(page.getByTestId("preview-markdown")).toContainText(
			"<!-- pagebreak -->",
		);
	});

	test("table action menu inserts a row", async ({ page }) => {
		await open(page);
		const rows = editor(page).locator("tr");
		await expect(rows).toHaveCount(4);
		await editor(page)
			.locator("td, th")
			.filter({ hasText: "Discovery" })
			.click();
		await page.getByTestId("table-cell-action-button").click();
		await expect(page.getByTestId("table-action-menu")).toBeVisible();
		await page.getByTestId("table-insert-row-below").click();
		await expect(rows).toHaveCount(5);
	});

	test("code action menu switches the block language", async ({ page }) => {
		await open(page);
		const code = editor(page).locator("code.editor-code");
		await code.hover();
		await expect(page.getByTestId("code-action-menu")).toBeVisible();
		await page.getByLabel("Code language").selectOption("python");
		await expect(code).toHaveAttribute("data-language", "python");
	});

	test("sticky note and inline image dialog", async ({ page }) => {
		await open(page);
		await caretAtEnd(page);
		await page.getByTestId("insert-sticky").click();
		await expect(
			page.getByTestId("lexical-editor").getByTestId("sticky-note"),
		).toHaveCount(1);
		await page.getByTestId("insert-inline-image").click();
		await expect(page.getByTestId("inline-image-dialog")).toBeVisible();
		await expect(page.getByTestId("inline-image-confirm")).toBeDisabled();
	});

	test("special text is opt-in and leaves markdown links alone", async ({
		page,
	}) => {
		await open(page);
		await openLab(page);
		await page.getByTestId("setting-specialText").check();
		await caretAtEnd(page);
		await page.keyboard.press("Enter");
		await page.keyboard.type("Note [draft] and [docs](https://lexical.dev) ");
		const json = await documentJson(page);
		expect(json).toContain('"type":"specialText"');
		expect(json).toContain('"url":"https://lexical.dev"');
		await page.getByRole("tab", { name: /Markdown/ }).click();
		await expect(page.getByTestId("preview-markdown")).toContainText(
			"Note [draft] and [docs](https://lexical.dev)",
		);
	});

	test("lab compares @lexical/markdown with @lexical/mdast and headless", async ({
		page,
	}) => {
		await open(page);
		await openLab(page);
		await page.getByTestId("run-export-comparison").click();
		await expect(page.getByTestId("export-mdast")).toContainText(
			"[@Suda Rakthai](mention:u2)",
		);
		await expect(page.getByTestId("export-mdast")).toContainText(
			"**{{contract_id}}**",
		);
		await expect(page.getByTestId("export-headless")).toContainText(
			'data-type="variable"',
		);
	});

	test("markdown source mode converts back without losing chips", async ({
		page,
	}) => {
		await open(page);
		const chips = editor(page).locator('[data-type="variable"]');
		const before = await chips.count();
		await page.getByTestId("action-markdown").click();
		await expect(editor(page).locator("code.editor-code")).toHaveAttribute(
			"data-language",
			"markdown",
		);
		await expect(chips).toHaveCount(0);
		await page.getByTestId("action-markdown").click();
		await expect(chips).toHaveCount(before);
		await expect(editor(page).locator("h1")).toContainText("ใบเสนอราคา");
	});

	test("debug panels: tree view and character limit", async ({ page }) => {
		await open(page);
		await openLab(page);
		await page.getByTestId("setting-treeView").check();
		await expect(page.getByTestId("tree-view")).toContainText("root");
		await page.getByTestId("setting-charLimit").selectOption("UTF-16");
		await expect(page.getByTestId("character-limit")).toHaveText(/^-\d+$/);
		expect(await documentJson(page)).toContain('"type":"overflow"');
	});

	test("other editors in the lab: plain text, legacy composer, pages", async ({
		page,
	}) => {
		await open(page);
		await openLab(page);
		await expect(page.getByTestId("plain-text-editor")).toContainText(
			"PlainTextExtension",
		);
		await expect(page.getByTestId("legacy-editor")).toContainText(
			"Legacy plugin API",
		);
		await expect(
			page.getByTestId("pages-editor").locator(".lexical-page"),
		).not.toHaveCount(0);
	});
});
