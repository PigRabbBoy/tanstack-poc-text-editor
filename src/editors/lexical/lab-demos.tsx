import { CodeNode } from "@lexical/code-core";
import { HorizontalRuleNode } from "@lexical/extension";
import { HashtagNode } from "@lexical/hashtag";
import { HistoryExtension } from "@lexical/history";
import { AutoLinkNode, autoLinkUrlMatcher, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { SelectionAlwaysOnDisplay } from "@lexical/react/LexicalSelectionAlwaysOnDisplay";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { useExtensionSignalValue } from "@lexical/react/useExtensionSignalValue";
import { HeadingNode, QuoteNode, RichTextExtension } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import {
	$createParagraphNode,
	$createTextNode,
	$getRoot,
	CLEAR_EDITOR_COMMAND,
	defineExtension,
	type Klass,
	type LexicalNode,
	ParagraphNode,
	TextNode,
} from "lexical";
import { useEffect, useState } from "react";
import { ExcalidrawNode } from "@/editors/lexical/components/playground/excalidraw";
import {
	$createPageBreakNode,
	INSERT_PAGE_BREAK,
} from "@/editors/lexical/components/playground/page-break";
import {
	DEFAULT_PAGE_SETUP,
	PAGE_SIZES,
	type PageSize,
	PagesExtension,
} from "@/editors/lexical/components/playground/pages";
import { $setPageSetup } from "@/editors/lexical/components/playground/pages/pageSetup";
import { StickyNode } from "@/editors/lexical/components/playground/sticky";
import { Button } from "@/editors/lexical/ui/button";
import { editorTheme } from "./theme";

const LEGACY_MARKDOWN = `## Legacy plugin API

This editor uses **LexicalComposer** with React plugins: history, lists, links, #hashtags, tables and markdown shortcuts.

- [ ] Check list item
- Visit https://lexical.dev`;

/**
 * The pre-extension API: LexicalComposer (deprecated in 0.52 but supported)
 * plus the classic React plugins, so each of them can be tried on the page.
 */
export function LegacyComposerDemo() {
	const [words, setWords] = useState(0);
	return (
		<LexicalComposer
			initialConfig={{
				namespace: "poc-lexical-legacy",
				theme: editorTheme,
				nodes: [
					HeadingNode,
					QuoteNode,
					ListNode,
					ListItemNode,
					LinkNode,
					AutoLinkNode,
					HashtagNode,
					TableNode,
					TableRowNode,
					TableCellNode,
					HorizontalRuleNode,
					CodeNode,
				],
				editorState: () =>
					$convertFromMarkdownString(LEGACY_MARKDOWN, TRANSFORMERS),
				onError: (error) => console.error(error),
			}}
		>
			<div className="relative rounded-md border bg-background">
				<RichTextPlugin
					contentEditable={
						<ContentEditable
							className="min-h-24 px-3 py-2 text-sm leading-6 outline-none"
							aria-label="Legacy LexicalComposer editor"
							data-testid="legacy-editor"
						/>
					}
					ErrorBoundary={LexicalErrorBoundary}
				/>
			</div>
			<HistoryPlugin />
			<ListPlugin />
			<CheckListPlugin />
			<LinkPlugin />
			<AutoLinkPlugin matchers={[autoLinkUrlMatcher]} />
			<ClickableLinkPlugin newTab />
			<HashtagPlugin />
			<TablePlugin />
			<HorizontalRulePlugin />
			<TabIndentationPlugin />
			<MarkdownShortcutPlugin transformers={TRANSFORMERS} />
			<SelectionAlwaysOnDisplay />
			<ClearEditorPlugin />
			<OnChangePlugin
				ignoreSelectionChange
				onChange={(editorState) =>
					setWords(
						editorState.read(
							() =>
								$getRoot().getTextContent().split(/\s+/).filter(Boolean).length,
						),
					)
				}
			/>
			<LegacyFooter words={words} />
		</LexicalComposer>
	);
}

function LegacyFooter({ words }: { words: number }) {
	const [editor] = useLexicalComposerContext();
	return (
		<div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
			<span data-testid="legacy-words">{words} words (OnChangePlugin)</span>
			<Button
				variant="ghost"
				size="xs"
				onClick={() => editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined)}
			>
				Clear (ClearEditorPlugin)
			</Button>
		</div>
	);
}

const PagesDemoExtension = defineExtension({
	name: "@poc/lexical/pages-demo",
	namespace: "poc-lexical-pages",
	dependencies: [RichTextExtension, HistoryExtension, PagesExtension],
	theme: editorTheme,
	$initialEditorState: () => {
		const root = $getRoot();
		for (let index = 1; index <= 14; index++) {
			root.append(
				$createParagraphNode().append(
					$createTextNode(
						`Paragraph ${index}: pages reflow as you type. ย่อหน้าที่ ${index} — เนื้อหาจะไหลไปหน้าถัดไปเมื่อเต็มหน้า`,
					),
				),
			);
			if (index === 10) root.append($createPageBreakNode());
		}
	},
});

function PageSetupControls() {
	const [editor] = useLexicalComposerContext();
	const pageSetup = useExtensionSignalValue(PagesExtension, "pageSetup");
	// Page setup lives in root NodeState; PagesExtension reacts to its
	// mutation, so switch paged mode on after the extension has registered.
	useEffect(() => {
		// Next task: the root listener that registers the mutation listener
		// runs after this effect on first mount.
		const timer = setTimeout(() =>
			editor.update(() => {
				$setPageSetup({ ...DEFAULT_PAGE_SETUP, pageSize: "A5" });
			}),
		);
		return () => clearTimeout(timer);
	}, [editor]);
	const update = (next: Partial<typeof DEFAULT_PAGE_SETUP> | null) =>
		editor.update(() => {
			$setPageSetup(
				next ? (prev) => ({ ...(prev ?? DEFAULT_PAGE_SETUP), ...next }) : null,
			);
		});
	return (
		<div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
			<select
				aria-label="Page size"
				data-testid="page-size"
				className="h-7 rounded-md border bg-background px-1.5"
				value={pageSetup?.pageSize ?? "pageless"}
				onChange={(event) =>
					update(
						event.target.value === "pageless"
							? null
							: { pageSize: event.target.value as PageSize },
					)
				}
			>
				<option value="pageless">Pageless</option>
				{(Object.keys(PAGE_SIZES) as PageSize[]).map((size) => (
					<option key={size} value={size}>
						{PAGE_SIZES[size].label}
					</option>
				))}
			</select>
			<select
				aria-label="Orientation"
				className="h-7 rounded-md border bg-background px-1.5"
				disabled={pageSetup === null}
				value={pageSetup?.orientation ?? "portrait"}
				onChange={(event) =>
					update({
						orientation: event.target.value as "portrait" | "landscape",
					})
				}
			>
				<option value="portrait">Portrait</option>
				<option value="landscape">Landscape</option>
			</select>
			<Button
				variant="outline"
				size="xs"
				onClick={() => {
					editor.focus();
					editor.dispatchCommand(INSERT_PAGE_BREAK, undefined);
				}}
			>
				Insert page break
			</Button>
		</div>
	);
}

/** The playground's PagesExtension: paginated A3–Letter pages with page breaks. */
export function PagesDemo() {
	return (
		<LexicalExtensionComposer
			extension={PagesDemoExtension}
			contentEditable={null}
		>
			<PageSetupControls />
			<div className="max-h-[32rem] overflow-auto rounded-md bg-muted/40 p-4">
				<ContentEditable
					className="text-sm leading-6 outline-none"
					aria-label="Paginated editor"
					data-testid="pages-editor"
				/>
			</div>
		</LexicalExtensionComposer>
	);
}

const FUZZ_NODES: Record<string, Klass<LexicalNode>> = {
	TextNode,
	ParagraphNode,
	HeadingNode,
	LinkNode,
	StickyNode,
	ExcalidrawNode,
};

/** Samples node JSON from the schemas nodes declare on $config (@lexical/fast-check). */
export function FuzzDemo() {
	const [type, setType] = useState("StickyNode");
	const [output, setOutput] = useState("");
	const sample = async () => {
		const [{ nodeArbitrary }, fc] = await Promise.all([
			import("@lexical/fast-check"),
			import("fast-check"),
		]);
		const klass = FUZZ_NODES[type];
		if (!klass) return;
		try {
			setOutput(JSON.stringify(fc.sample(nodeArbitrary(klass), 3), null, 2));
		} catch (error) {
			setOutput(error instanceof Error ? error.message : String(error));
		}
	};
	return (
		<div className="grid gap-2">
			<div className="flex flex-wrap items-center gap-2">
				<select
					aria-label="Node type"
					className="h-7 rounded-md border bg-background px-1.5 text-sm"
					value={type}
					onChange={(event) => setType(event.target.value)}
				>
					{Object.keys(FUZZ_NODES).map((name) => (
						<option key={name}>{name}</option>
					))}
				</select>
				<Button
					variant="outline"
					size="sm"
					onClick={sample}
					data-testid="run-fuzz"
				>
					Sample 3 random nodes
				</Button>
			</div>
			{output && (
				<pre
					className="max-h-56 overflow-auto rounded-md border bg-muted/40 p-2 font-mono text-[11px]"
					data-testid="fuzz-output"
				>
					{output}
				</pre>
			)}
		</div>
	);
}
