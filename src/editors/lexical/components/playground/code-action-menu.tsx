/**
 * Ported from the Lexical playground (MIT, (c) Meta Platforms, Inc.):
 * plugins/CodeActionMenuPlugin (+ CopyButton, PrettierButton,
 * formatCodeWithPrettier) @ v0.52.0.
 *
 * POC changes: a language picker (Shiki or Prism list, whichever highlighter is
 * active) replaces the read-only language label; Tailwind + lucide icons.
 */
import { $isCodeNode, CodeNode } from "@lexical/code-core";
import { getCodeLanguageOptions as getPrismLanguages } from "@lexical/code-prism";
import { getCodeLanguageOptions as getShikiLanguages } from "@lexical/code-shiki";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$getNearestNodeFromDOMNode,
	getComposedEventTarget,
	isHTMLElement,
	type LexicalEditor,
	registerEventListener,
} from "lexical";
import { Check, Copy, Sparkles, TriangleAlert } from "lucide-react";
import type { Options } from "prettier";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

const PRETTIER_PARSERS: Record<string, () => Promise<unknown[]>> = {
	css: () => Promise.all([import("prettier/plugins/postcss")]),
	html: () => Promise.all([import("prettier/plugins/html")]),
	js: () =>
		Promise.all([
			import("prettier/plugins/babel"),
			import("prettier/plugins/estree"),
		]),
	javascript: () =>
		Promise.all([
			import("prettier/plugins/babel"),
			import("prettier/plugins/estree"),
		]),
	markdown: () => Promise.all([import("prettier/plugins/markdown")]),
	ts: () =>
		Promise.all([
			import("prettier/plugins/typescript"),
			import("prettier/plugins/estree"),
		]),
	typescript: () =>
		Promise.all([
			import("prettier/plugins/typescript"),
			import("prettier/plugins/estree"),
		]),
};

const PRETTIER_OPTIONS: Record<string, Options> = {
	css: { parser: "css" },
	html: { parser: "html" },
	js: { parser: "babel" },
	javascript: { parser: "babel" },
	markdown: { parser: "markdown" },
	ts: { parser: "typescript" },
	typescript: { parser: "typescript" },
};

export function canBePrettier(lang: string): boolean {
	return lang in PRETTIER_OPTIONS;
}

export async function formatCodeWithPrettier(
	content: string,
	lang: string,
): Promise<string> {
	const [{ format }, plugins] = await Promise.all([
		import("prettier/standalone"),
		PRETTIER_PARSERS[lang]?.() ?? Promise.resolve([]),
	]);
	const options: Options = {
		...PRETTIER_OPTIONS[lang],
		plugins: plugins.map(
			(plugin) =>
				((plugin as { default?: unknown }).default ?? plugin) as never,
		),
	};
	return format(content, options);
}

function readCode(
	editor: LexicalEditor,
	codeElement: HTMLElement,
): { lang: string; text: string } | null {
	return editor.read(() => {
		const node = $getNearestNodeFromDOMNode(codeElement);
		return $isCodeNode(node)
			? { lang: node.getLanguage() ?? "", text: node.getTextContent() }
			: null;
	});
}

export function CodeActionMenuPlugin({
	highlighter,
}: {
	highlighter: "shiki" | "prism";
}) {
	const [editor] = useLexicalComposerContext();
	const [codeElement, setCodeElement] = useState<HTMLElement | null>(null);
	const [rect, setRect] = useState<DOMRect | null>(null);
	const [lang, setLang] = useState("");
	const [copied, setCopied] = useState(false);
	const [error, setError] = useState("");
	const [hasCode, setHasCode] = useState(false);
	const menuRef = useRef<HTMLDivElement | null>(null);

	const languages = useMemo(
		() => (highlighter === "prism" ? getPrismLanguages() : getShikiLanguages()),
		[highlighter],
	);

	useEffect(
		() =>
			editor.registerMutationListener(
				CodeNode,
				() => {
					setHasCode(
						editor.read(() =>
							Array.from(editor.getEditorState()._nodeMap.values()).some(
								$isCodeNode,
							),
						),
					);
				},
				{ skipInitialization: false },
			),
		[editor],
	);

	useEffect(() => {
		if (!hasCode) {
			setCodeElement(null);
			return;
		}
		return registerEventListener(document, "mousemove", (event) => {
			const target = getComposedEventTarget(event);
			if (!isHTMLElement(target)) {
				return;
			}
			if (menuRef.current?.contains(target)) {
				return;
			}
			const root = editor.getRootElement();
			const code = target.closest<HTMLElement>("code.editor-code");
			if (code === null || root === null || !root.contains(code)) {
				setCodeElement(null);
				return;
			}
			const info = readCode(editor, code);
			if (info === null) {
				return;
			}
			setCodeElement(code);
			setLang(info.lang);
			setRect(code.getBoundingClientRect());
		});
	}, [editor, hasCode]);

	useEffect(() => {
		if (codeElement === null) {
			setError("");
			setCopied(false);
		}
	}, [codeElement]);

	if (codeElement === null || rect === null || !editor.isEditable()) {
		return null;
	}

	const updateCode = (fn: (node: CodeNode) => void) =>
		editor.update(() => {
			const node = $getNearestNodeFromDOMNode(codeElement);
			if ($isCodeNode(node)) {
				fn(node);
			}
		});

	const copy = async () => {
		const info = readCode(editor, codeElement);
		if (info === null) {
			return;
		}
		await navigator.clipboard.writeText(info.text);
		setCopied(true);
		setTimeout(() => setCopied(false), 1000);
	};

	const prettify = async () => {
		const info = readCode(editor, codeElement);
		if (info === null || info.text === "") {
			return;
		}
		try {
			const formatted = await formatCodeWithPrettier(info.text, info.lang);
			updateCode((node) => {
				node.select(0).insertText(formatted.replace(/\n$/, ""));
			});
			setError("");
		} catch (caught: unknown) {
			setError(caught instanceof Error ? caught.message : String(caught));
		}
	};

	return createPortal(
		<div
			ref={menuRef}
			className="fixed z-40 flex items-center gap-1 rounded-md border bg-background/95 p-0.5 text-xs shadow-sm"
			style={{ top: rect.top + 4, left: rect.right - 8, transform: "translateX(-100%)" }}
			data-testid="code-action-menu"
		>
			<select
				aria-label="Code language"
				className="h-6 max-w-32 rounded border-0 bg-transparent px-1 text-xs"
				value={lang}
				onChange={(event) => {
					const next = event.target.value;
					setLang(next);
					updateCode((node) => {
						node.setLanguage(next);
					});
				}}
			>
				<option value="">(No language)</option>
				{languages.map(([value, label]) => (
					<option key={value} value={value}>
						{label}
					</option>
				))}
			</select>
			<button
				type="button"
				className="inline-flex size-6 items-center justify-center rounded hover:bg-muted"
				aria-label="Copy code"
				title="Copy"
				onClick={copy}
			>
				{copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
			</button>
			{canBePrettier(lang) && (
				<button
					type="button"
					className={cn(
						"inline-flex size-6 items-center justify-center rounded hover:bg-muted",
						error && "text-destructive",
					)}
					aria-label="Format with Prettier"
					title={error || "Format with Prettier"}
					onClick={prettify}
				>
					{error ? (
						<TriangleAlert className="size-3.5" />
					) : (
						<Sparkles className="size-3.5" />
					)}
				</button>
			)}
		</div>,
		document.body,
	);
}
