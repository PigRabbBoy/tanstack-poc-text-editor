import { codeBlockOptions } from "@blocknote/code-block";
import { type CodeBlockOptions, createExtension } from "@blocknote/core";
import { Plugin } from "@tiptap/pm/state";

const supported = codeBlockOptions.supportedLanguages;

/**
 * @blocknote/code-block's Shiki languages, with plain text as the default.
 *
 * With `supportedLanguages` set, the code block renders a language <select> that throws
 * "Language X is not supported." for any `language` prop outside the list, which kills
 * the editor. Three sources produce such values: the "```" shortcut (language ""),
 * markdown/HTML fences that use an alias (the sample's ```ts) and unknown fences
 * (```foo). `resolveCodeLanguage` maps them all onto a listed id; it is applied to
 * initial content (`normalizeCodeBlocks`) and to every later transaction
 * (`CodeLanguageGuard`).
 */
export const codeLanguages = {
	...codeBlockOptions,
	defaultLanguage: "text",
	supportedLanguages: {
		...supported,
		// "" is what the bare ``` shortcut passes to the input rule.
		text: {
			...supported.text,
			aliases: [...(supported.text.aliases ?? []), ""],
		},
	},
} satisfies CodeBlockOptions;

const FALLBACK = "text";

/** A supported language id for any id, alias or unknown name (case-insensitive). */
export function resolveCodeLanguage(language: unknown): string {
	if (typeof language !== "string") return FALLBACK;
	const name = language.trim().toLowerCase();
	for (const [id, { aliases }] of Object.entries(
		codeLanguages.supportedLanguages,
	)) {
		if (id === name || aliases?.includes(name)) return id;
	}
	return FALLBACK;
}

type JsonBlock = {
	type?: unknown;
	props?: Record<string, unknown>;
	children?: unknown;
};

/** Deep copy of block JSON with every code block's language resolved. */
export function normalizeCodeBlocks<T>(blocks: T[]): T[] {
	return blocks.map((block) => {
		const source = block as JsonBlock;
		const next: JsonBlock = { ...source };
		if (source.type === "codeBlock")
			next.props = {
				...source.props,
				language: resolveCodeLanguage(source.props?.language),
			};
		if (Array.isArray(source.children))
			next.children = normalizeCodeBlocks(source.children);
		return next as T;
	});
}

/** Rewrites unsupported code block languages before the view renders them. */
export const CodeLanguageGuard = createExtension(() => ({
	key: "codeLanguageGuard",
	prosemirrorPlugins: [
		new Plugin({
			appendTransaction(transactions, _old, state) {
				if (!transactions.some((tr) => tr.docChanged)) return null;
				let tr = state.tr;
				state.doc.descendants((node, pos) => {
					if (node.type.name !== "codeBlock") return !node.isTextblock;
					const language = resolveCodeLanguage(node.attrs.language);
					if (language !== node.attrs.language)
						tr = tr.setNodeMarkup(pos, undefined, { ...node.attrs, language });
					return false;
				});
				return tr.docChanged ? tr : null;
			},
		}),
	],
}));
