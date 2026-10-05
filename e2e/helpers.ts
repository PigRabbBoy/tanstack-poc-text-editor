import type { Page } from "@playwright/test";

/** Navigates and waits for React hydration (see HydrationMarker in __root.tsx). */
export async function gotoHydrated(page: Page, path: string) {
	await page.goto(path);
	await page
		.locator("html[data-hydrated='true']")
		.waitFor({ state: "attached", timeout: 30_000 });
}
