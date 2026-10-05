import { MarkdownPlugin } from "@platejs/markdown";
import {
	createSlateEditor,
	type Descendant,
	ElementApi,
	KEYS,
	type Value,
} from "platejs";
import { serializeHtml } from "platejs/static";
import { BaseEditorKit } from "@/editors/plate/components/editor/editor-base-kit";
import { EditorStatic } from "@/editors/plate/ui/editor-static";
import type { Snapshot } from "@/editors/types";

/** Headless editor with the static (React-free) kit: markdown + HTML + Rendered. */
export function createStaticPlateEditor(value: Value) {
	return createSlateEditor({ plugins: BaseEditorKit, value });
}

export function valueToMarkdown(value: Value): string {
	return createStaticPlateEditor(value)
		.getApi(MarkdownPlugin)
		.markdown.serialize();
}

export function markdownToValue(markdown: string): Value {
	const editor = createStaticPlateEditor([]);
	return editor.getApi(MarkdownPlugin).markdown.deserialize(markdown);
}

export async function valueToHtml(value: Value): Promise<string> {
	return serializeHtml(createStaticPlateEditor(value), {
		editorComponent: EditorStatic,
	});
}

/**
 * Combobox "input" elements (`slash_input`, `mention_input`, `variable_input`…)
 * only exist while a menu is open, and media `placeholder`s only while a file
 * is being read; they are not content (and markdown has no rule for them).
 */
function withoutInputs<T extends Descendant>(nodes: T[]): T[] {
	return nodes.flatMap((node) => {
		if (!ElementApi.isElement(node)) return [node];
		if (node.type.endsWith("_input") || node.type === KEYS.placeholder)
			return [];
		return [{ ...node, children: withoutInputs(node.children) }];
	});
}

export async function toSnapshot(editorValue: Value): Promise<Snapshot> {
	const value = withoutInputs(editorValue);
	return {
		json: value,
		markdown: valueToMarkdown(value),
		html: await valueToHtml(value),
	};
}
