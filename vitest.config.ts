import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: { tsconfigPaths: true },
	test: {
		environment: "jsdom",
		include: ["src/**/*.test.{ts,tsx}"],
		// @blocknote/math-block imports KaTeX CSS; inline it so Vite handles the CSS import.
		server: { deps: { inline: ["@blocknote/math-block"] } },
	},
});
