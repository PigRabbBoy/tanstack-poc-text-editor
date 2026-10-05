import "katex/dist/katex.min.css";
import "./tiptap.css";
import type { Node as PMNode } from "@tiptap/pm/model";
import type { JSONContent } from "@tiptap/react";
import { renderToHTMLString } from "@tiptap/static-renderer/pm/html-string";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import katex from "katex";
import { createElement, type ReactNode, useMemo } from "react";
import type { RenderedProps } from "@/editors/types";
import { cn } from "@/lib/utils";
import { lowlight, schemaExtensions } from "./extensions";
import { chipClassName, variableTitle } from "./variable-chip";

type HastNode = {
	type: string;
	value?: string;
	tagName?: string;
	properties?: { className?: string[] | string };
	children?: HastNode[];
};

function hastToReact(nodes: HastNode[] | undefined, prefix = "h"): ReactNode[] {
	return (nodes ?? []).map((node, index) => {
		const key = `${prefix}-${index}`;
		if (node.type === "text") return node.value ?? "";
		if (node.type !== "element" || !node.tagName) return null;
		const className = node.properties?.className;
		return createElement(
			node.tagName,
			{
				key,
				className: Array.isArray(className) ? className.join(" ") : className,
			},
			...hastToReact(node.children, key),
		);
	});
}

function HighlightedCode({ node }: { node: PMNode }) {
	const language = node.attrs.language as string | null;
	const code = node.textContent;
	const tree =
		language && lowlight.registered(language)
			? lowlight.highlight(language, code)
			: lowlight.highlightAuto(code);
	return (
		<pre>
			<code className={language ? `language-${language} hljs` : "hljs"}>
				{hastToReact(tree.children as HastNode[])}
			</code>
		</pre>
	);
}

function MathFormula({ latex, display }: { latex: string; display: boolean }) {
	const html = katex.renderToString(latex, {
		displayMode: display,
		throwOnError: false,
	});
	const Tag = display ? "div" : "span";
	return (
		<Tag
			data-type={display ? "block-math" : "inline-math"}
			// KaTeX output for a formula the user typed in this browser.
			// biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX renders to an HTML string
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}

const extensions = schemaExtensions();

/**
 * Embeds (iframe / audio) render their raw HTML attributes (allowfullscreen,
 * frameborder, cc_language…), which React rejects as props; render those nodes
 * with the static renderer's HTML-string output instead.
 */
function EmbedHtml({ node }: { node: PMNode }) {
	const html = renderToHTMLString({ content: node, extensions });
	return (
		<div
			className="contents"
			// Markup produced by the extension's own renderHTML for this node.
			// biome-ignore lint/security/noDangerouslySetInnerHtml: static-renderer HTML string
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}

/** Read-only render from JSON via `@tiptap/static-renderer` (no editor instance). */
export function TiptapRendered({ json }: RenderedProps) {
	const element = useMemo(() => {
		try {
			return renderToReactElement({
				content: json as JSONContent,
				extensions,
				options: {
					nodeMapping: {
						variable: ({ node }) => {
							const name = String(node.attrs.name ?? "");
							return (
								<span
									data-type="variable"
									data-name={name}
									title={variableTitle(name)}
									className={chipClassName}
								>
									{`{{${name}}}`}
								</span>
							);
						},
						codeBlock: ({ node }) => <HighlightedCode node={node} />,
						inlineMath: ({ node }) => (
							<MathFormula
								latex={String(node.attrs.latex ?? "")}
								display={false}
							/>
						),
						blockMath: ({ node }) => (
							<MathFormula latex={String(node.attrs.latex ?? "")} display />
						),
						taskItem: ({ node, children }) => (
							<li data-type="taskItem" data-checked={node.attrs.checked}>
								<label contentEditable={false}>
									<input
										type="checkbox"
										checked={Boolean(node.attrs.checked)}
										readOnly
										disabled
									/>
								</label>
								<div>{children}</div>
							</li>
						),
						youtube: ({ node }) => <EmbedHtml node={node} />,
						twitch: ({ node }) => <EmbedHtml node={node} />,
						audio: ({ node }) => <EmbedHtml node={node} />,
					},
					markMapping: {
						rubyText: ({ mark, children }) => (
							<ruby>
								{children}
								<rt>{String(mark.attrs.rt ?? "")}</rt>
							</ruby>
						),
					},
				},
			});
		} catch (error) {
			return (
				<p className="text-destructive">
					Could not render this document: {String(error)}
				</p>
			);
		}
	}, [json]);

	return (
		<div
			className={cn("tiptap-prose tiptap-static")}
			data-testid="tiptap-rendered"
		>
			{element}
		</div>
	);
}

/** Default export for the lazy import in index.tsx. */
export default TiptapRendered;
