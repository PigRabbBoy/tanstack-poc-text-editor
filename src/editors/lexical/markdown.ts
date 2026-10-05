import {
	$convertFromMarkdownString,
	$convertToMarkdownString,
} from "@lexical/markdown";
import type { ElementNode } from "lexical";
import { EDITOR_TRANSFORMERS } from "./transformers";

/** Imports markdown into the root (or `node`) using the shared transformers. */
export function $importMarkdown(
	markdown: string,
	shouldPreserveNewLines = false,
	node?: ElementNode,
): void {
	$convertFromMarkdownString(
		markdown,
		EDITOR_TRANSFORMERS,
		node,
		shouldPreserveNewLines,
	);
}

/** Exports the whole document as markdown using the shared transformers. */
export function $exportMarkdown(shouldPreserveNewLines = false): string {
	return $convertToMarkdownString(
		EDITOR_TRANSFORMERS,
		undefined,
		shouldPreserveNewLines,
	);
}
