import {
	createSlatePlugin,
	type Decorate,
	KEYS,
	type RenderLeafProps,
	TextApi,
	type TRange,
	type TText,
} from "platejs";
import { Plate, usePlateEditor } from "platejs/react";
import Prism from "prismjs";
import "prismjs/components/prism-markdown.js";
import { BasicNodesKit } from "@/editors/plate/components/editor/plugins/basic-nodes-kit";
import { Editor, EditorContainer } from "@/editors/plate/ui/editor";
import { cn } from "@/lib/utils";

type Token = string | Prism.Token;

function tokenLength(token: Token): number {
	if (typeof token === "string") return token.length;
	if (typeof token.content === "string") return token.content.length;
	if (Array.isArray(token.content))
		return token.content.reduce<number>((sum, t) => sum + tokenLength(t), 0);
	return tokenLength(token.content);
}

/** Registry "Preview Markdown" example: Prism tokens become decorations. */
const decoratePreview: Decorate = ({ entry: [node, path] }) => {
	if (!TextApi.isText(node)) return [];
	const ranges: TRange[] = [];
	let start = 0;
	for (const token of Prism.tokenize(node.text, Prism.languages.markdown)) {
		const end = start + tokenLength(token);
		if (typeof token !== "string")
			ranges.push({
				anchor: { offset: start, path },
				focus: { offset: end, path },
				[token.type]: true,
			} as TRange);
		start = end;
	}
	return ranges;
};

type PreviewText = TText & {
	blockquote?: boolean;
	bold?: boolean;
	code?: boolean;
	hr?: boolean;
	italic?: boolean;
	list?: boolean;
	title?: boolean;
};

function PreviewLeaf({
	attributes,
	children,
	leaf,
}: RenderLeafProps<PreviewText>) {
	return (
		<span
			{...attributes}
			className={cn(
				leaf.bold && "font-bold",
				leaf.italic && "italic",
				leaf.title && "inline-block font-heading text-lg font-bold",
				leaf.list && "pl-2 text-primary-text",
				leaf.hr && "block border-b-2 border-border text-center",
				leaf.blockquote &&
					"inline-block border-l-2 border-primary pl-2 italic text-muted-foreground",
				leaf.code && "rounded-sm bg-muted px-1 font-mono",
			)}
		>
			{children}
		</span>
	);
}

const line = (text: string) => ({ type: KEYS.p, children: [{ text }] });

const VALUE = [
	line("## Preview Markdown"),
	line(
		"Decorations format text by its content: **bold**, _italic_ and `code`.",
	),
	line("- A list item"),
	line("> A quote"),
	line("---"),
	line("Type more markdown here and watch it style itself."),
];

export function PreviewMarkdownLab() {
	const editor = usePlateEditor({
		plugins: [
			...BasicNodesKit,
			createSlatePlugin({ key: "preview-markdown", decorate: decoratePreview }),
		],
		value: VALUE,
	});
	return (
		<Plate editor={editor}>
			<EditorContainer
				variant="select"
				data-testid="plate-lab-preview-markdown"
			>
				<Editor variant="select" renderLeaf={PreviewLeaf} />
			</EditorContainer>
		</Plate>
	);
}
