/** @jsxImportSource @tiptap/core */
// renderHTML below uses Tiptap's own JSX runtime (DOMOutputSpec), not React.
import type { NodeViewRendererProps } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import type { Node as PMNode } from "@tiptap/pm/model";
import { mergeAttributes } from "@tiptap/react";
import { escapeHtml } from "@/lib/conventions";

function attr(element: HTMLElement, name: string): string | null {
	return element.getAttribute(name);
}

function size(value: string | null): number | null {
	const parsed = value ? Number.parseInt(value, 10) : Number.NaN;
	return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Official Image node with its v3 resize handles, plus a caption.
 * The caption is the image `title`, so markdown keeps it (`![alt](src "caption")`)
 * and HTML exports it as <figure><img><figcaption>.
 */
export const CaptionedImage = Image.extend({
	parseHTML() {
		return [
			{
				tag: 'figure[data-type="image"]',
				getAttrs: (element) => {
					const img = element.querySelector("img");
					if (!img) return false;
					return {
						src: attr(img, "src"),
						alt: attr(img, "alt"),
						title:
							element.querySelector("figcaption")?.textContent ??
							attr(img, "title"),
						width: size(attr(img, "width")),
						height: size(attr(img, "height")),
					};
				},
			},
			...(this.parent?.() ?? []),
		];
	},

	renderHTML({ node, HTMLAttributes }) {
		const attrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes);
		// biome-ignore lint/a11y/useAltText: `alt` is a node attribute inside the spread
		const image = <img {...attrs} />;
		const caption = node.attrs.title as string | null;
		if (!caption) return image;
		return (
			<figure data-type="image">
				{image}
				<figcaption>{caption}</figcaption>
			</figure>
		);
	},

	// Markdown has no image size: a resized image is written as an <img> tag instead.
	renderMarkdown(node) {
		const { src, alt, title, width, height } = node.attrs ?? {};
		if (!width && !height) {
			const caption = title ? ` "${String(title).replaceAll('"', "'")}"` : "";
			return `![${alt ?? ""}](${src ?? ""}${caption})`;
		}
		const attrs = { src, alt, title, width, height };
		const html = Object.entries(attrs)
			.filter(
				([, value]) => value !== null && value !== undefined && value !== "",
			)
			.map(([key, value]) => `${key}="${escapeHtml(String(value))}"`)
			.join(" ");
		return `<img ${html}>`;
	},

	addNodeView() {
		const resizable = this.parent?.();
		if (!resizable) return null;
		return (props: NodeViewRendererProps) => {
			const view = resizable(props);
			const caption = document.createElement("figcaption");
			caption.className = "tiptap-image-caption";
			caption.contentEditable = "false";
			let current: PMNode = props.node;
			const sync = (node: PMNode) => {
				const text = (node.attrs.title as string | null) ?? "";
				caption.textContent = text;
				caption.hidden = text === "";
			};
			sync(current);
			view.dom.appendChild(caption);

			const update = view.update?.bind(view);
			view.update = (node, decorations, innerDecorations) => {
				if (node.type !== current.type) return false;
				// ResizableNodeView only applies width/height on creation: rebuild on size changes
				// (size presets in the image menu, undo of a resize).
				if (
					node.attrs.width !== current.attrs.width ||
					node.attrs.height !== current.attrs.height
				)
					return false;
				current = node;
				sync(node);
				return update ? update(node, decorations, innerDecorations) : true;
			};
			return view;
		};
	},
});
