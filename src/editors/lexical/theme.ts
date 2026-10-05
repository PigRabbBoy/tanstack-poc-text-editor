import type { EditorThemeClasses } from "lexical";
import { editorTheme as registryTheme } from "@/editors/lexical/components/editor/theme";
import "@/editors/lexical/components/editor/theme.css";

/** The registry theme with Boonmee Lab typography (Poppins headings, roomy Thai line-height). */
export const editorTheme: EditorThemeClasses = {
	...registryTheme,
	paragraph: "relative m-0 mb-3 leading-7 last:mb-0",
	heading: {
		h1: "relative mt-6 mb-4 font-heading text-3xl font-semibold leading-tight tracking-tight first:mt-0 last:mb-0",
		h2: "relative mt-6 mb-3 border-b pb-2 font-heading text-2xl font-semibold leading-tight first:mt-0 last:mb-0",
		h3: "relative mt-5 mb-2 font-heading text-xl font-semibold leading-snug first:mt-0 last:mb-0",
		h4: "relative mt-4 mb-2 font-heading text-lg font-semibold first:mt-0 last:mb-0",
		h5: "relative mt-3 mb-2 font-heading text-base font-semibold first:mt-0 last:mb-0",
		h6: "relative mt-3 mb-2 font-heading text-sm font-semibold first:mt-0 last:mb-0",
	},
	quote:
		"relative my-4 border-s-4 border-primary bg-accent/40 py-1 ps-5 text-foreground/80 first:mt-0 last:mb-0",
	link: "cursor-pointer text-primary-text underline underline-offset-2 hover:opacity-80",
};
