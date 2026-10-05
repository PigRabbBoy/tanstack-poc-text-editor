import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const config = defineConfig({
	// Lets parallel dev servers keep separate dependency caches.
	cacheDir: process.env.VITE_CACHE_DIR,
	resolve: { tsconfigPaths: true },
	// scripts/bundle-sizes.mjs reads the client manifest to measure each editor route.
	environments: { client: { build: { manifest: true } } },
	plugins: [
		devtools(),
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
	],
});

export default config;
