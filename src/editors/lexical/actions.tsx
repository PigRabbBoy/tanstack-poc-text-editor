import { $createCodeNode, $isCodeNode } from "@lexical/code-core";
import {
	editorStateFromSerializedDocument,
	serializedDocumentFromEditorState,
} from "@lexical/file";
import {
	$generateHtmlFromNodes,
	$generateNodesFromDOMViaExtension,
	$withRenderContext,
	contextValue,
} from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalAriaLiveRegion } from "@lexical/react/useLexicalAriaLiveRegion";
import {
	$createParagraphNode,
	$getRoot,
	$insertNodes,
	CLEAR_HISTORY_COMMAND,
	RootNode,
} from "lexical";
import { BookOpen, Code, FileCode2, Share2 } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { formatCodeWithPrettier } from "@/editors/lexical/components/playground/code-action-menu";
import { RenderContextTerse } from "@/editors/lexical/components/playground/terse-export";
import { Button } from "@/editors/lexical/ui/button";
import { docFromHash, docToHash } from "./doc-hash";
import { $exportMarkdown, $importMarkdown } from "./markdown";
import { useLabSettings } from "./settings";

type Mode = "wysiwyg" | "markdown" | "html";

function ActionButton({
	label,
	pressed,
	onClick,
	children,
	testId,
}: {
	label: string;
	pressed?: boolean;
	onClick: () => void;
	children: ReactNode;
	testId?: string;
}) {
	return (
		<Button
			variant="ghost"
			size="icon-xs"
			className="text-muted-foreground aria-pressed:bg-muted aria-pressed:text-foreground"
			title={label}
			aria-label={label}
			aria-pressed={pressed}
			data-testid={testId}
			onClick={onClick}
		>
			{children}
		</Button>
	);
}

/**
 * The Lexical playground's ActionsPlugin pieces the registry lacks: share the
 * document as a URL hash, and edit it as markdown or (terse, Prettier-formatted)
 * HTML source inside a single code block, then convert back.
 */
export function PlaygroundActions() {
	const [editor] = useLexicalComposerContext();
	// Screen readers hear action results through the @lexical/a11y live region.
	const announce = useLexicalAriaLiveRegion();
	const { settings } = useLabSettings();
	const [mode, setMode] = useState<Mode>("wysiwyg");
	const unregisterTransform = useRef(() => {});

	// Load a shared document from the URL hash once.
	useEffect(() => {
		docFromHash(window.location.hash).then((doc) => {
			if (doc === null) return;
			editor.setEditorState(editorStateFromSerializedDocument(editor, doc));
			editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
			toast.success("Loaded the shared document from the link");
		});
	}, [editor]);

	// While in a source mode, keep the root as exactly one code block.
	useEffect(() => {
		if (mode === "wysiwyg") return;
		const unregister = editor.registerNodeTransform(RootNode, (root) => {
			let code = root.getChildren().find($isCodeNode);
			if (!code) code = $createCodeNode(mode);
			if (root.getChildrenSize() !== 1 || !code.getParent()) {
				root.splice(0, root.getChildrenSize(), [code]);
				code.select();
			}
			if (code.getLanguage() !== mode) code.setLanguage(mode);
		});
		unregisterTransform.current = unregister;
		return unregister;
	}, [editor, mode]);

	const share = async () => {
		const doc = serializedDocumentFromEditorState(editor.getEditorState(), {
			source: "Boonmee Lab POC",
		});
		const url = new URL(window.location.href);
		url.hash = await docToHash(doc);
		window.history.replaceState({}, "", url.toString());
		try {
			await navigator.clipboard.writeText(url.toString());
			toast.success("Share link copied to the clipboard");
			announce("Share link copied to the clipboard");
		} catch {
			toast.success("Share link is in the address bar");
		}
	};

	const toSource = async (next: "markdown" | "html") => {
		if (next === "markdown") {
			editor.update(() => {
				const markdown = $exportMarkdown(settings.preserveNewlinesInMarkdown);
				const code = $createCodeNode("markdown");
				$getRoot().clear().append(code);
				code.select().insertRawText(markdown);
			});
		} else {
			const raw = editor.read(() =>
				$withRenderContext(
					[contextValue(RenderContextTerse, true)],
					editor,
				)(() => $generateHtmlFromNodes(editor)),
			);
			const html = await formatCodeWithPrettier(raw, "html").catch(() => raw);
			editor.update(() => {
				const code = $createCodeNode("html");
				$getRoot().clear().append(code);
				code.select().insertRawText(html.trimEnd());
			});
		}
		setMode(next);
		announce(
			`Editing the document as ${next === "html" ? "HTML" : "Markdown"}`,
		);
	};

	const fromSource = (current: "markdown" | "html") => {
		// Drop the single-code-block transform before converting back.
		unregisterTransform.current();
		setMode("wysiwyg");
		announce("Converted back to rich text");
		editor.update(() => {
			const root = $getRoot();
			const source = root.getTextContent();
			if (current === "markdown") {
				$importMarkdown(source, settings.preserveNewlinesInMarkdown);
			} else {
				const dom = new DOMParser().parseFromString(source, "text/html");
				const nodes = $generateNodesFromDOMViaExtension(dom);
				root.clear().select();
				$insertNodes(nodes);
				if (root.isEmpty()) root.append($createParagraphNode()).select();
			}
		});
	};

	const toggle = (target: "markdown" | "html") => {
		if (mode === "wysiwyg") void toSource(target);
		else if (mode === target) fromSource(target);
	};

	return (
		<div className="flex items-center gap-1" data-testid="playground-actions">
			<ActionButton label="Share as link" onClick={share} testId="action-share">
				<Share2 />
			</ActionButton>
			<ActionButton
				label={
					mode === "markdown" ? "Convert from Markdown" : "Edit as Markdown"
				}
				pressed={mode === "markdown"}
				onClick={() => toggle("markdown")}
				testId="action-markdown"
			>
				<FileCode2 />
			</ActionButton>
			<ActionButton
				label={mode === "html" ? "Convert from HTML" : "Edit as HTML"}
				pressed={mode === "html"}
				onClick={() => toggle("html")}
				testId="action-html"
			>
				<Code />
			</ActionButton>
			<a
				href="https://lexical.dev/docs/intro"
				target="_blank"
				rel="noreferrer"
				title="Lexical docs"
				aria-label="Lexical docs"
				className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
			>
				<BookOpen className="size-3" />
			</a>
		</div>
	);
}
