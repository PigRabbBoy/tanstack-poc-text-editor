import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

/**
 * @platejs/docx-io → html-to-vdom → htmlparser2@3, whose lib/Stream.js does
 * `require("../")`. Rolldown (Vite 8's dep optimizer and bundler) cannot
 * resolve a bare parent-directory specifier, so point it at the package entry.
 * Needed in every optimizer (client + the workerd SSR env) and in the build.
 */
const htmlparser2ParentRequire = {
	name: "htmlparser2-parent-require",
	resolveId: {
		filter: { id: /^\.\.\/$/ },
		handler(source: string, importer: string | undefined) {
			if (source !== "../" || !importer) return null;
			if (!/[\\/]htmlparser2[\\/]lib[\\/][^\\/]+\.js$/.test(importer))
				return null;
			return path.join(path.dirname(importer), "index.js");
		},
	},
} satisfies Plugin;

const config = defineConfig({
	// Lets parallel dev servers keep separate dependency caches.
	cacheDir: process.env.VITE_CACHE_DIR,
	resolve: { tsconfigPaths: true },
	optimizeDeps: { rolldownOptions: { plugins: [htmlparser2ParentRequire] } },
	// scripts/bundle-sizes.mjs reads the client manifest to measure each editor route.
	environments: {
		client: { build: { manifest: true } },
		ssr: {
			optimizeDeps: {
				rolldownOptions: { plugins: [htmlparser2ParentRequire] },
			},
		},
	},
	plugins: [
		htmlparser2ParentRequire,
		devtools(),
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
	],
});

export default config;
