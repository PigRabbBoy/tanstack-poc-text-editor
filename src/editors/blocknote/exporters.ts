/**
 * Export to every format BlockNote's exporters support. Each format lazy-loads its
 * packages on click (docx, react-pdf, the 25 MB Typst wasm…), so none of them is in
 * the editor chunk. All exporters share one mapping table extension: our variable and
 * mention chips export as their markdown text, the Alert block as a paragraph with a
 * bold label, and the math/diagram packages contribute their own mappings.
 */

import anuphanRegularUrl from "@expo-google-fonts/anuphan/400Regular/Anuphan_400Regular.ttf?url";
import anuphanBoldUrl from "@expo-google-fonts/anuphan/700Bold/Anuphan_700Bold.ttf?url";
import { alertType } from "./alert";
import { blocksToHtml } from "./markdown";
import type { AppBlock, AppEditor } from "./schema";

export const EXPORT_FORMATS = [
	{
		id: "docx",
		label: "Word (.docx)",
		source: "@blocknote/xl-docx-exporter",
	},
	{
		id: "odt",
		label: "OpenDocument (.odt)",
		source: "@blocknote/xl-odt-exporter",
	},
	{
		id: "pdf",
		label: "PDF/UA (.pdf, Typst)",
		source: "@blocknote/xl-pdf-exporter",
	},
	{
		id: "react-pdf",
		label: "PDF (.pdf, react-pdf, deprecated)",
		source: "@blocknote/xl-pdf-exporter/react-pdf",
	},
	{
		id: "typst",
		label: "Typst markup (.typ)",
		source: "@blocknote/xl-typst-exporter",
	},
	{
		id: "email",
		label: "Email HTML (.html, React Email)",
		source: "@blocknote/xl-email-exporter",
	},
	{
		id: "full-html",
		label: "BlockNote HTML (blocksToFullHTML)",
		source: "@blocknote/core",
	},
	{
		id: "html",
		label: "Interoperable HTML (blocksToHTMLLossy)",
		source: "@blocknote/core",
	},
] as const;

export type ExportFormat = (typeof EXPORT_FORMATS)[number]["id"];

const FILE_NAME = "blocknote-export";

function save(data: Blob | string, filename: string, type = "text/plain") {
	const blob = typeof data === "string" ? new Blob([data], { type }) : data;
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.append(link);
	link.click();
	link.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Images here are data URLs or same-origin paths (`/brand/wordmark.png`). BlockNote's
 * default resolver routes every file through its hosted CORS proxy, which cannot reach
 * either, so files are fetched directly instead.
 */
async function resolveFileUrl(url: string): Promise<string | Blob> {
	if (url.startsWith("data:")) return url;
	const response = await fetch(new URL(url, window.location.href));
	if (!response.ok) throw new Error(`Could not load ${url} for export`);
	return response.blob();
}

type Fn = (...args: never[]) => unknown;
type Mappings = {
	blockMapping: Record<string, Fn>;
	inlineContentMapping: Record<string, Fn>;
	styleMapping: Record<string, Fn>;
};
type Extra = Partial<Mappings>;

type TextItem = { type: "text"; text: string; styles: Record<string, unknown> };
type ChipItem = { props: Record<string, string> };
type AlertBlock = {
	props: { type: string; textAlignment: string; textColor: string };
	content: unknown[];
};

/**
 * Adds the mappings for our own schema entries to an exporter's default mappings.
 * The exporters type their mapping tables against the schema; this table is built
 * dynamically, so it is returned as `never` and checked at runtime instead (an
 * exporter throws "missing a mapping" for any type it lacks).
 */
function withAppMappings(defaults: Mappings, extra: Extra = {}): never {
	const text = defaults.inlineContentMapping.text as unknown as (
		item: TextItem,
		...rest: unknown[]
	) => unknown;
	const paragraph = defaults.blockMapping.paragraph as unknown as (
		block: unknown,
		...rest: unknown[]
	) => unknown;
	const asText = (value: string) => ({ type: "text", text: value, styles: {} });
	return {
		...defaults,
		blockMapping: {
			...defaults.blockMapping,
			alert: (block: AlertBlock, ...rest: unknown[]) =>
				paragraph(
					{
						...block,
						type: "paragraph",
						props: {
							backgroundColor: "default",
							textColor: block.props.textColor,
							textAlignment: block.props.textAlignment,
						},
						content: [
							{
								type: "text",
								text: `${alertType(block.props.type).title}: `,
								styles: { bold: true },
							},
							...block.content,
						],
					},
					...rest,
				),
			...extra.blockMapping,
		},
		inlineContentMapping: {
			...defaults.inlineContentMapping,
			variable: (item: ChipItem, ...rest: unknown[]) =>
				text(asText(`{{${item.props.name}}}`) as TextItem, ...rest),
			mention: (item: ChipItem, ...rest: unknown[]) =>
				text(asText(`@${item.props.label}`) as TextItem, ...rest),
			...extra.inlineContentMapping,
		},
		styleMapping: {
			...defaults.styleMapping,
			// The Font style is dropped by default (react-pdf would need the font registered);
			// DOCX, ODT and email pass the family name on, Typst keeps its loaded fonts.
			font: () => ({}),
			...extra.styleMapping,
		},
	} as never;
}

/**
 * The math and diagram packages ship no react-pdf mappings (only DOCX, ODT, email and
 * Typst), so for the deprecated react-pdf exporter their source is exported as a code
 * block (LaTeX / Mermaid) and inline math as `$…$` text.
 */
function sourceAsCode(defaults: Mappings): Extra {
	const code = defaults.blockMapping.codeBlock as unknown as (
		block: unknown,
		...rest: unknown[]
	) => unknown;
	const text = defaults.inlineContentMapping.text as unknown as (
		item: TextItem,
		...rest: unknown[]
	) => unknown;
	const asCode =
		(language: string) =>
		(block: { content: unknown }, ...rest: unknown[]) =>
			code({ ...block, type: "codeBlock", props: { language } }, ...rest);
	return {
		blockMapping: {
			mathBlock: asCode("latex"),
			diagram: asCode("mermaid"),
		} as Record<string, Fn>,
		inlineContentMapping: {
			math: (item: { content: string }, ...rest: unknown[]) =>
				text({ type: "text", text: `$${item.content}$`, styles: {} }, ...rest),
		} as Record<string, Fn>,
	};
}

/** Anuphan (the app's Thai face) as TTF bytes: the bundled PDF fonts have no Thai glyphs. */
async function thaiFonts(): Promise<Uint8Array[]> {
	return Promise.all(
		[anuphanRegularUrl, anuphanBoldUrl].map(async (url) => {
			const response = await fetch(url);
			return new Uint8Array(await response.arrayBuffer());
		}),
	);
}

const TITLE = "BlockNote export";

/** The bundled body font's family name (docs mention a DEFAULT_FONT_FAMILY export; 0.55 does not export it). */
const BODY_FONT = "Inter 18pt";

async function exportDocx(editor: AppEditor, blocks: AppBlock[]) {
	const [{ DOCXExporter, docxDefaultSchemaMappings }, math, diagram] =
		await Promise.all([
			import("@blocknote/xl-docx-exporter"),
			import("@blocknote/math-block/docx-exporter"),
			import("@blocknote/diagram-block/docx-exporter"),
		]);
	const exporter = new DOCXExporter(
		editor.schema,
		withAppMappings(docxDefaultSchemaMappings as unknown as Mappings, {
			blockMapping: {
				mathBlock: math.mathBlockMapping,
				diagram: diagram.diagramBlockMapping,
			} as Record<string, Fn>,
			inlineContentMapping: { math: math.inlineMathMapping },
			styleMapping: { font: (font: string) => ({ font }) } as Record<
				string,
				Fn
			>,
		}),
		{ resolveFileUrl },
	);
	save(
		await exporter.toBlob(blocks, {
			documentOptions: { title: TITLE, creator: "Text Editor POC" },
			sectionOptions: {},
			locale: "th-TH",
		}),
		`${FILE_NAME}.docx`,
	);
}

async function exportOdt(editor: AppEditor, blocks: AppBlock[]) {
	const [{ ODTExporter, odtDefaultSchemaMappings }, math, diagram] =
		await Promise.all([
			import("@blocknote/xl-odt-exporter"),
			import("@blocknote/math-block/odt-exporter"),
			import("@blocknote/diagram-block/odt-exporter"),
		]);
	const exporter = new ODTExporter(
		editor.schema,
		withAppMappings(odtDefaultSchemaMappings as unknown as Mappings, {
			blockMapping: {
				mathBlock: math.mathBlockMapping,
				diagram: diagram.diagramBlockMapping,
			} as Record<string, Fn>,
			inlineContentMapping: { math: math.inlineMathMapping } as Record<
				string,
				Fn
			>,
			styleMapping: {
				font: (font: string) => ({ "fo:font-family": font }),
			} as Record<string, Fn>,
		}),
		{ resolveFileUrl },
	);
	save(await exporter.toODTDocument(blocks), `${FILE_NAME}.odt`);
}

async function typstMappings() {
	const [typst, math, diagram] = await Promise.all([
		import("@blocknote/xl-typst-exporter"),
		import("@blocknote/math-block/typst-exporter"),
		import("@blocknote/diagram-block/typst-exporter"),
	]);
	return {
		typst,
		mappings: withAppMappings(
			typst.typstDefaultSchemaMappings as unknown as Mappings,
			{
				blockMapping: {
					mathBlock: math.mathBlockMapping,
					diagram: diagram.diagramBlockMapping,
				} as Record<string, Fn>,
				inlineContentMapping: { math: math.inlineMathMapping },
				// Typst only knows the fonts loaded into the compiler; keep the body font.
				styleMapping: { font: () => (inner: string) => inner } as Record<
					string,
					Fn
				>,
			},
		),
	};
}

async function exportTypst(editor: AppEditor, blocks: AppBlock[]) {
	const { typst, mappings } = await typstMappings();
	const exporter = new typst.TypstExporter(editor.schema, mappings, {
		resolveFileUrl,
		fontFamily: [BODY_FONT, "Anuphan"],
	});
	save(
		await exporter.toTypst(blocks, { title: TITLE, lang: "th" }),
		`${FILE_NAME}.typ`,
	);
}

/**
 * Typst compiled to wasm in the browser (PDF/UA-1 when the document conforms). The
 * bundled body fonts are Inter, so Anuphan is added as the per-glyph Thai fallback; the
 * wasm URL is passed explicitly because the package's own `new URL(…, import.meta.url)`
 * breaks once Vite pre-bundles it in dev.
 */
async function exportPdf(editor: AppEditor, blocks: AppBlock[]) {
	const [{ mappings }, pdf, { default: wasm }] = await Promise.all([
		typstMappings(),
		import("@blocknote/xl-pdf-exporter"),
		import("@blocknote/xl-typst-compiler/wasm?url"),
	]);
	const exporter = new pdf.PDFExporter(editor.schema, mappings, {
		resolveFileUrl,
		wasm,
		fontFamily: [BODY_FONT, "Anuphan"],
		fonts: Promise.all([pdf.loadDefaultBodyFonts(), thaiFonts()]).then(
			([defaults, thai]) => [...defaults, ...thai],
		),
	});
	const result = await exporter.toPDF(blocks, { title: TITLE, lang: "th" });
	if (result.error)
		throw new Error(
			`Typst could not compile the document: ${result.compileErrors
				.map((error) => error.message)
				.join("; ")}`,
		);
	save(result.blob, `${FILE_NAME}.pdf`);
	return result.pdfUA.declared
		? "PDF/UA-1 declared"
		: result.pdfUA.reason === "nonconforming"
			? `Tagged PDF (not PDF/UA: ${result.pdfUA.violations[0]?.message ?? "nonconforming"})`
			: "Tagged PDF";
}

/**
 * The deprecated react-pdf exporter. react-pdf breaks lines at spaces only, and Thai
 * has none, so words are split with Intl.Segmenter; Anuphan is registered for every
 * style react-pdf may ask for (it has no italic face). Emoji images would come from a
 * CDN, so they are turned off.
 */
async function exportReactPdf(editor: AppEditor, blocks: AppBlock[]) {
	const [{ PDFExporter, pdfDefaultSchemaMappings }, { Font, pdf }] =
		await Promise.all([
			import("@blocknote/xl-pdf-exporter/react-pdf"),
			import("@react-pdf/renderer"),
		]);
	const segmenter = new Intl.Segmenter("th", { granularity: "word" });
	Font.registerHyphenationCallback((word) =>
		Array.from(segmenter.segment(word), (part) => part.segment),
	);
	const exporter = new PDFExporter(
		editor.schema,
		withAppMappings(
			pdfDefaultSchemaMappings as unknown as Mappings,
			sourceAsCode(pdfDefaultSchemaMappings as unknown as Mappings),
		),
		{
			resolveFileUrl,
			emojiSource: false,
			fontFamily: "Anuphan",
			fonts: [
				{
					family: "Anuphan",
					fonts: [
						{ src: anuphanRegularUrl },
						{ src: anuphanRegularUrl, fontStyle: "italic" },
						{ src: anuphanBoldUrl, fontWeight: "bold" },
						{ src: anuphanBoldUrl, fontWeight: "bold", fontStyle: "italic" },
					],
				},
			],
		},
	);
	const document = await exporter.toReactPDFDocument(blocks);
	save(await pdf(document).toBlob(), `${FILE_NAME}-react-pdf.pdf`);
}

async function exportEmail(editor: AppEditor, blocks: AppBlock[]) {
	const [
		{ ReactEmailExporter, reactEmailDefaultSchemaMappings },
		math,
		diagram,
	] = await Promise.all([
		import("@blocknote/xl-email-exporter"),
		import("@blocknote/math-block/email-exporter"),
		import("@blocknote/diagram-block/email-exporter"),
	]);
	const exporter = new ReactEmailExporter(
		editor.schema,
		withAppMappings(reactEmailDefaultSchemaMappings as unknown as Mappings, {
			blockMapping: {
				mathBlock: math.createMathBlockMapping(),
				diagram: diagram.createDiagramBlockMapping(),
			} as Record<string, Fn>,
			inlineContentMapping: { math: math.createInlineMathMapping() } as Record<
				string,
				Fn
			>,
			styleMapping: {
				font: (fontFamily: string) => ({ fontFamily }),
			} as Record<string, Fn>,
		}),
		{ resolveFileUrl },
	);
	save(
		await exporter.toReactEmailDocument(blocks, {
			preview: "BlockNote export",
		}),
		`${FILE_NAME}-email.html`,
		"text/html",
	);
}

/** Runs one export and returns a short status for the toast, if there is one. */
export async function runExport(
	format: ExportFormat,
	editor: AppEditor,
): Promise<string | undefined> {
	const blocks = editor.document;
	switch (format) {
		case "pdf":
			return exportPdf(editor, blocks);
		case "docx":
			await exportDocx(editor, blocks);
			return;
		case "odt":
			await exportOdt(editor, blocks);
			return;
		case "react-pdf":
			await exportReactPdf(editor, blocks);
			return;
		case "typst":
			await exportTypst(editor, blocks);
			return;
		case "email":
			await exportEmail(editor, blocks);
			return;
		case "full-html":
			save(
				editor.blocksToFullHTML(blocks),
				`${FILE_NAME}-blocknote.html`,
				"text/html",
			);
			return;
		case "html":
			save(blocksToHtml(editor, blocks), `${FILE_NAME}.html`, "text/html");
			return;
	}
}
