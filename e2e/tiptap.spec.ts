import { expect, type Locator, type Page, test } from "@playwright/test";

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
		const input = page.getByTestId("tiptap-image-input");
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

const PNG_120X80 = Buffer.from(
	"iVBORw0KGgoAAAANSUhEUgAAAHgAAABQCAIAAABd+SbeAAAAg0lEQVR42u3QQQ0AAAgEoEtkQivbwRbOBxsJyFRzIApEi0a0aNEWRItGtGjRFkSLRrRo0YgWjWjRohEtGtGiRSNaNKJFi0a0aESLFo1o0YgWLRrRohEtWjSiRSNatGhEi0a0aNGIFo1o0aIRLRrRokUjWjSiRYtGtGhEixaNaNGI/mMBejah9s2AjmsAAAAASUVORK5CYII=",
	"base64",
);

/**
 * Selects the first word of the block that contains `text` with the keyboard.
 * (A double-click lands on the element's centre, which is rarely that word.)
 */
async function selectWord(page: Page, text: string) {
	await content(page)
		.getByText(text, { exact: false })
		.first()
		.click({ position: { x: 2, y: 8 } });
	await page.keyboard.press("Home");
	await page.keyboard.press("Shift+Control+ArrowRight");
	// The bubble menu appears once ProseMirror has read the new selection.
	await expect(page.getByTestId("tiptap-bubble-menu")).toBeVisible();
}

/** Opens a toolbar menu once the previous one has finished closing. */
async function openMenu(page: Page, trigger: Locator) {
	await expect(page.getByRole("menu")).toHaveCount(0);
	await trigger.click();
	await expect(page.getByRole("menu")).toBeVisible();
}

async function markdownPreview(page: Page) {
	await page.getByRole("tab", { name: /Markdown/ }).click();
	return page.getByTestId("preview-markdown");
}

test.describe("Tiptap tools", () => {
	test("font family, size and background come from TextStyleKit and survive markdown", async ({
		page,
	}) => {
		await openFresh(page);
		await selectWord(page, "Discovery");
		await page.getByTestId("tiptap-font-family").click();
		await page.getByRole("menuitemradio", { name: "Poppins" }).click();
		await openMenu(page, page.getByTestId("tiptap-font-size"));
		await page.getByRole("menuitemradio", { name: "20px" }).click();
		await openMenu(
			page,
			page
				.getByTestId("tiptap-toolbar")
				.getByRole("button", { name: "Text colour and highlight" }),
		);
		await page.getByTestId("tiptap-bg-lavender").click();
		await expect(
			content(page).locator(
				'span[style*="Poppins"][style*="20px"][style*="background-color"]',
			),
		).toHaveText("Discovery");
		await expect(await markdownPreview(page)).toContainText(
			"font-family: Poppins; font-size: 20px",
		);
	});

	test("find and replace replaces every match", async ({ page }) => {
		await openFresh(page);
		await content(page).locator("h1").click();
		await page.keyboard.press("Control+f");
		const find = page.getByTestId("tiptap-find");
		await expect(find).toBeVisible();
		await find.getByLabel("Find", { exact: true }).fill("Discovery");
		await expect(page.getByTestId("tiptap-find-count")).toHaveText(/ of /);
		await expect(
			content(page).locator(".find-and-replace-result"),
		).not.toHaveCount(0);
		await find.getByLabel("Replace with").fill("Kickoff");
		await find.getByRole("button", { name: "All" }).click();
		await expect(content(page)).toContainText("Kickoff workshop");
		await expect(content(page)).not.toContainText("Discovery");
	});

	test("image resize presets and caption reach the HTML and markdown", async ({
		page,
	}) => {
		await openFresh(page);
		await caretAtEnd(page);
		await page.keyboard.press("Enter");
		await page.getByTestId("tiptap-image-input").setInputFiles({
			name: "dot.png",
			mimeType: "image/png",
			buffer: PNG_120X80,
		});
		const image = content(page).locator('img[src^="data:image/png"]');
		await expect(image).toHaveCount(1);
		await image.click();
		const bubble = page.getByTestId("tiptap-image-bubble");
		await expect(bubble).toBeVisible();
		await bubble.getByTestId("tiptap-image-caption").click();
		const prompt = page.getByTestId("tiptap-prompt");
		await prompt.getByRole("textbox").fill("Figure 1 dot");
		await prompt.getByRole("button", { name: "Update" }).click();
		await expect(
			content(page).locator(".tiptap-image-caption:not([hidden])"),
		).toHaveText("Figure 1 dot");
		await image.click();
		await bubble.getByRole("button", { name: "Width 240px" }).click();
		await expect(image).toHaveCSS("width", "240px");
		await expect(await markdownPreview(page)).toContainText(
			'title="Figure 1 dot" width="240"',
		);
		await page.getByRole("tab", { name: "Rendered" }).click();
		await expect(
			page.getByTestId("tiptap-rendered").locator("figcaption"),
		).toHaveText("Figure 1 dot");
	});

	test("ruby annotation via the toolbar exports <ruby> markdown", async ({
		page,
	}) => {
		await openFresh(page);
		await selectWord(page, "Checklist");
		await page.getByTestId("tiptap-toolbar").getByTestId("tiptap-ruby").click();
		const prompt = page.getByTestId("tiptap-prompt");
		await prompt.getByRole("textbox").fill("เช็กลิสต์");
		await prompt.getByRole("button", { name: "Insert" }).click();
		await expect(content(page).locator("ruby rt")).toHaveText("เช็กลิสต์");
		await expect(await markdownPreview(page)).toContainText(
			"<ruby>Checklist<rt>เช็กลิสต์</rt></ruby>",
		);
	});

	test("settings toggle invisible characters, block IDs and read-only", async ({
		page,
	}) => {
		await openFresh(page);
		const settings = page.getByTestId("tiptap-settings");
		await openMenu(page, settings);
		await page.getByRole("menuitemcheckbox", { name: /Invisible/ }).click();
		await expect(
			content(page).locator(".tiptap-invisible-character").first(),
		).toBeAttached();
		await openMenu(page, settings);
		await page.getByRole("menuitemcheckbox", { name: /Block IDs/ }).click();
		await expect(
			content(page).locator("h1[data-block-label^='heading · ']"),
		).toHaveCount(1);
		await openMenu(page, settings);
		await page.getByRole("menuitemcheckbox", { name: /Read-only/ }).click();
		await expect(content(page)).toHaveAttribute("contenteditable", "false");
		await expect(page.getByTestId("tiptap-status")).toContainText("read-only");
	});

	test("floating menu on an empty line and slash → Insert markdown", async ({
		page,
	}) => {
		await openFresh(page);
		await caretAtEnd(page);
		await page.keyboard.press("Enter");
		const floating = page.getByTestId("tiptap-floating-menu");
		await expect(floating).toBeVisible();
		await floating.getByRole("button", { name: "Heading 2" }).click();
		await page.keyboard.type("Floating heading");
		await expect(
			content(page).locator("h2", { hasText: "Floating heading" }),
		).toBeVisible();
		await page.keyboard.press("Enter");
		await page.keyboard.type("/markdown");
		await page
			.getByTestId("tiptap-suggestion")
			.getByText("Insert markdown", { exact: true })
			.click();
		const prompt = page.getByTestId("tiptap-prompt");
		await prompt.getByRole("textbox").fill("- pay {{amount}} by {{due_date}}");
		await prompt.getByRole("button", { name: "Insert" }).click();
		await expect(
			content(page).locator('li [data-type="variable"][data-name="due_date"]'),
		).toHaveCount(1);
	});

	test("editor events are counted live", async ({ page }) => {
		await openFresh(page);
		const update = page
			.getByTestId("tiptap-events")
			.locator('[data-event="update"]');
		const count = async () =>
			Number((await update.innerText()).replace(/\D/g, ""));
		const before = await count();
		await caretAtEnd(page);
		await page.keyboard.type("abc");
		await expect.poll(count).toBeGreaterThanOrEqual(before + 3);
	});
});
