import { exportToDocx, importDocx } from "@platejs/docx-io";
import {
	type Descendant,
	ElementApi,
	type SlateEditor,
	type SlatePlugin,
	TextApi,
	type Value,
} from "platejs";
import { BaseEditorKit } from "@/editors/plate/components/editor/editor-base-kit";
import { DocxExportKit } from "@/editors/plate/components/editor/plugins/docx-export-kit";
import { EditorStatic } from "@/editors/plate/ui/editor-static";

/**
 * React escapes quotes inside `style` attributes (`&#x27;`, `&quot;`), and the
 * browser build of juice (which docx-io runs on the HTML) splits declarations
 * on the entity's `;`. Unquoted family names are valid CSS, so drop the quotes.
 */
function withoutQuotedFonts<T extends Descendant>(nodes: T[]): T[] {
	return nodes.map((node) => {
		if (TextApi.isText(node) && typeof node.fontFamily === "string")
			return { ...node, fontFamily: node.fontFamily.replace(/["']/g, "") };
		if (ElementApi.isElement(node))
			return { ...node, children: withoutQuotedFonts(node.children) };
		return node;
	});
}

/**
 * Word import/export (@platejs/docx-io: mammoth + html-to-vdom + juice).
 * Loaded with `import()` from the toolbar so the converters only download when
 * someone clicks "Export as Word" / "Import from Word".
 */
export async function valueToDocx(value: Value): Promise<Blob> {
	return exportToDocx(withoutQuotedFonts(value), {
		editorPlugins: [...BaseEditorKit, ...DocxExportKit] as SlatePlugin[],
		editorStaticComponent: EditorStatic,
		fontFamily: "Work Sans",
		title: "Plate POC",
	});
}

export async function docxToNodes(editor: SlateEditor, file: ArrayBuffer) {
	const result = await importDocx(editor, file);
	return {
		nodes: result.nodes as Value,
		comments: result.comments,
		warnings: result.warnings,
	};
}
