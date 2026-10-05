import { readFile } from "node:fs/promises";
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

/** Plain text goes through `paste`; rich paste through `beforeinput` (Slate, Chrome). */
async function paste(page: Page, data: Record<string, string>) {
	await page.evaluate((data) => {
		const target = document.activeElement;
		if (!target) throw new Error("nothing focused");
		const transfer = new DataTransfer();
		for (const [type, value] of Object.entries(data))
			transfer.setData(type, value);
		const init = { bubbles: true, cancelable: true };
		target.dispatchEvent(
			Object.keys(data).length === 1 && "text/plain" in data
				? new ClipboardEvent("paste", { ...init, clipboardData: transfer })
				: new InputEvent("beforeinput", {
						...init,
						inputType: "insertFromPaste",
						dataTransfer: transfer,
					}),
		);
	}, data);
}

const WORD_HTML = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta name=Generator content="Microsoft Word 15"></head><body lang=EN-US><!--StartFragment--><p class=MsoNormal><b><span style='font-size:12.0pt'>Bold from Word</span></b> and plain</p><p class=MsoListParagraphCxSpFirst style='text-indent:-18.0pt;mso-list:l0 level1 lfo1'><![if !supportLists]><span style='mso-list:Ignore'>1.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span><![endif]>First Word item</p><p class=MsoListParagraphCxSpLast style='text-indent:-18.0pt;mso-list:l0 level1 lfo1'><![if !supportLists]><span style='mso-list:Ignore'>2.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span><![endif]>Second Word item</p><!--EndFragment--></body></html>`;

test.describe("Plate tools", () => {
	test("slash menu lists the added tools and inserts a Heading 4", async ({
		page,
	}) => {
		const { editor } = await openPlate(page);
		await caretAtEndOf(page, "ขอแสดงความนับถือ,");
		await page.keyboard.press("Enter");
		await page.keyboard.type("/");
		const menu = page.getByRole("listbox");
		for (const name of ["Heading 4", "Video", "Embed", "4 columns", "Emoji"])
			await expect(menu.getByRole("option", { name, exact: true })).toHaveCount(
				1,
			);
		await page.keyboard.type("Heading 4");
		await page.keyboard.press("Enter");
		// The slash input is replaced by the block; let focus settle before typing.
		await expect(editor.locator("h4")).toHaveCount(1);
		await page.waitForTimeout(200);
		await page.keyboard.type("plate-e2e-h4");
		await expect(editor.locator("h4")).toHaveText("plate-e2e-h4");
	});

	test("find highlights matches and replace all rewrites them", async ({
		page,
	}) => {
		const { editor } = await openPlate(page);
		await page
			.getByTestId("plate-editor")
			.getByLabel("Find & replace", { exact: true })
			.click();
		const panel = page.getByTestId("plate-find-replace");
		await panel.getByLabel("Find").fill("Boonmee");
		await expect(page.getByTestId("plate-find-count")).toHaveText("2 found");
		await expect(editor.locator("[data-search-highlight]").first()).toHaveText(
			"Boonmee",
		);
		await panel.getByLabel("Replace with").fill("BML");
		await panel.getByRole("button", { name: "Replace all" }).click();
		await expect(page.getByTestId("plate-find-count")).toHaveText("0 found");
		await expect(editor).toContainText("ไว้วางใจ BML Lab");
		await expect(await markdownPreview(page)).toContainText(
			"[link to BML Lab](",
		);
	});

	test("font family menu lists the Boonmee Lab fonts first and applies one", async ({
		page,
	}) => {
		const { editor } = await openPlate(page);
		await editor.getByText("Scope of work").dblclick();
		const button = page
			.getByTestId("plate-editor")
			.getByLabel("Font family", { exact: true });
		await button.click();
		const fonts = page
			.getByTestId("plate-font-family-menu")
			.getByRole("menuitemradio");
		await expect(fonts).toHaveText([
			"Default font",
			"Work Sans",
			"Poppins",
			"Montserrat",
			"Anuphan",
			"Arial",
			"Tahoma",
			"Georgia",
			"Times New Roman",
			"Courier New",
		]);
		await fonts.filter({ hasText: "Poppins" }).click();
		await expect(
			editor.locator('[data-slate-leaf][style*="font-family: Poppins"]'),
		).toHaveCount(1);
		await expect(button).toContainText("Poppins");
	});

	test("pasting CSV inserts a table", async ({ page }) => {
		const { editor } = await openPlate(page);
		await expect(editor.locator("table")).toHaveCount(1);
		await caretAtEndOf(page, "ขอแสดงความนับถือ,");
		await page.keyboard.press("Enter");
		await paste(page, {
			"text/plain": "Item,Qty,Price\nWidget,2,100\nGadget,1,250",
		});
		await expect(editor.locator("table")).toHaveCount(2);
		await expect(editor.locator("table").last()).toContainText("Gadget");
	});

	test("pasting from Word keeps bold and list items, drops Word markup", async ({
		page,
	}) => {
		const { editor } = await openPlate(page);
		await caretAtEndOf(page, "ขอแสดงความนับถือ,");
		await page.keyboard.press("Enter");
		await paste(page, {
			"text/html": WORD_HTML,
			"text/plain":
				"Bold from Word and plain\nFirst Word item\nSecond Word item",
		});
		await expect(
			editor.locator("strong", { hasText: "Bold from Word" }),
		).toHaveCount(1);
		await expect(editor).toContainText("Second Word item");
		await expect(editor).not.toContainText("mso");
		await expect(editor).not.toContainText("supportLists");
	});

	test("exports to Word and imports the .docx back", async ({ page }) => {
		const { editor } = await openPlate(page);
		const toolbar = page.getByTestId("plate-editor");
		await toolbar.getByLabel("Export", { exact: true }).click();
		const [download] = await Promise.all([
			page.waitForEvent("download", { timeout: 60_000 }),
			page.getByRole("menuitem", { name: "Export as Word" }).click(),
		]);
		expect(download.suggestedFilename()).toBe("plate.docx");
		const file = await download.path();
		expect((await readFile(file)).subarray(0, 2).toString()).toBe("PK");

		await caretAtEndOf(page, "ขอแสดงความนับถือ,");
		await toolbar.getByLabel("Import", { exact: true }).click();
		const [chooser] = await Promise.all([
			page.waitForEvent("filechooser"),
			page.getByRole("menuitem", { name: "Import from Word" }).click(),
		]);
		await chooser.setFiles(file);
		await expect(editor.getByText("Scope of work")).toHaveCount(2, {
			timeout: 30_000,
		});
	});

	test("block menu turns a block into a heading", async ({ page }) => {
		const { editor } = await openPlate(page);
		await editor.getByText("ขอแสดงความนับถือ,").click({ button: "right" });
		const menu = page.getByTestId("plate-block-context-menu");
		await expect(
			menu.getByRole("menuitem", { name: "Text color" }),
		).toBeVisible();
		await menu.getByText("Turn into", { exact: true }).hover();
		await page
			.getByRole("menuitem", { name: "Heading 2", exact: true })
			.click();
		await expect(
			editor.locator("h2", { hasText: "ขอแสดงความนับถือ," }),
		).toHaveCount(1);
	});

	test("version history shows a diff of what changed", async ({ page }) => {
		const { editor } = await openPlate(page);
		await page.getByTestId("plate-showcase").locator("summary").click();
		await page.getByTestId("plate-save-version").click();
		await caretAtEndOf(page, "ขอแสดงความนับถือ,");
		await page.keyboard.type(" plate-e2e-diff");
		await expect(editor).toContainText("plate-e2e-diff");
		await page.getByRole("button", { name: "Compare v1 with now" }).click();
		await expect(
			page.getByTestId("plate-version-diff").locator('[data-diff="insert"]'),
		).toContainText("plate-e2e-diff");
	});

	test("lab: classic lists, tags and single-line fields", async ({ page }) => {
		await openPlate(page);
		await page.getByTestId("plate-lab").locator("summary").click();
		const classic = page.getByTestId("plate-lab-classic-list");
		await expect(classic.locator("li ol li")).toHaveCount(2, {
			timeout: 30_000,
		});
		await expect(classic.getByRole("checkbox")).toHaveCount(2);

		await page
			.getByTestId("plate-lab-tags")
			.locator('[data-slate-editor="true"]')
			.click();
		await page.keyboard.type("Draft");
		await page.getByRole("option", { name: "Draft", exact: true }).click();
		await expect(page.getByTestId("plate-lab-tags-value")).toHaveText(
			"Quotation, Draft",
		);

		const title = page
			.getByTestId("plate-lab-single-line")
			.locator('[data-slate-editor="true"]');
		await title.click();
		await page.keyboard.press("End");
		await page.keyboard.press("Enter");
		await page.keyboard.type(" — enter is ignored".repeat(4));
		await expect(title.locator('[data-slate-node="element"]')).toHaveCount(1);
		await expect(page.getByTestId("plate-lab-title-count")).toHaveText("60/60");
	});

	test("the tool inventory lists included and excluded tools", async ({
		page,
	}) => {
		await openPlate(page);
		const inventory = page.getByTestId("tool-inventory");
		await expect(inventory.locator("summary")).toContainText(
			/Plate tools: \d+ of \d+ on this page/,
		);
		await inventory.locator("summary").click();
		await expect(inventory).toContainText("DOCX Import/Export");
		await expect(inventory).toContainText("Collaboration (Yjs)");
	});
});
