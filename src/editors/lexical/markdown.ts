import {
	$convertFromMarkdownString,
	$convertToMarkdownString,
} from "@lexical/markdown";
import { EDITOR_TRANSFORMERS } from "./transformers";

/** Imports markdown into the root using the shared transformers. */
export function $importMarkdown(markdown: string): void {
	$convertFromMarkdownString(markdown, EDITOR_TRANSFORMERS);
}

/** Exports the whole document as markdown using the shared transformers. */
export function $exportMarkdown(): string {
	return $convertToMarkdownString(EDITOR_TRANSFORMERS);
}
