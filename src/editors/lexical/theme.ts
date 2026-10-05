import type { EditorThemeClasses } from "lexical";
import { editorTheme as registryTheme } from "@/editors/lexical/components/editor/theme";
import "@/editors/lexical/components/editor/theme.css";
import "@/editors/lexical/components/playground/playground.css";

/** Prism token classes (@lexical/code-prism); Shiki colours tokens inline. */
const PRISM_TOKENS: Record<string, string> = {
	atrule: "text-sky-700",
	attr: "text-sky-700",
	boolean: "text-fuchsia-700",
	builtin: "text-emerald-700",
	cdata: "text-slate-500",
	char: "text-emerald-700",
	class: "text-amber-700",
	"class-name": "text-amber-700",
	comment: "text-slate-500 italic",
	constant: "text-fuchsia-700",
	deleted: "bg-red-500/15 text-red-700",
	doctype: "text-slate-500",
	entity: "text-amber-700",
	function: "text-amber-700",
	important: "text-orange-700",
	inserted: "bg-emerald-500/15 text-emerald-700",
	keyword: "text-sky-700",
	namespace: "text-orange-700",
	number: "text-fuchsia-700",
	operator: "text-slate-600",
	prolog: "text-slate-500",
	property: "text-fuchsia-700",
	punctuation: "text-slate-500",
	regex: "text-orange-700",
	selector: "text-emerald-700",
	string: "text-emerald-700",
	symbol: "text-fuchsia-700",
	tag: "text-fuchsia-700",
	url: "text-amber-700",
	variable: "text-orange-700",
};

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
	hashtag: "rounded-sm bg-accent px-0.5 text-primary-text",
	specialText: "rounded-sm bg-muted px-1 font-semibold text-secondary",
	codeHighlight: { ...registryTheme.codeHighlight, ...PRISM_TOKENS },
	inlineImage: "inline-block align-top",
	tableRowStriping: "editor-table-row-striping",
	tableFrozenRow: "editor-table-frozen-row",
	tableFrozenColumn: "editor-table-frozen-column",
};
