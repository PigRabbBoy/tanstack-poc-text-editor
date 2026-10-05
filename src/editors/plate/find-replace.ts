import { type SlateEditor, TextApi, type TRange, type TText } from "platejs";

/**
 * Case-insensitive matches of `search`, one range per occurrence inside a
 * single text leaf. @platejs/find-replace only decorates (highlights); the
 * docs leave Replace to the app, so this is ours. Matches that span two leaves
 * with different marks are highlighted by the plugin but not replaced.
 */
export function findRanges(editor: SlateEditor, search: string): TRange[] {
	if (!search) return [];
	const needle = search.toLowerCase();
	const ranges: TRange[] = [];
	for (const [node, path] of editor.api.nodes<TText>({
		at: [],
		match: (n) => TextApi.isText(n),
	})) {
		const haystack = node.text.toLowerCase();
		let start = haystack.indexOf(needle);
		while (start !== -1) {
			ranges.push({
				anchor: { path, offset: start },
				focus: { path, offset: start + search.length },
			});
			start = haystack.indexOf(needle, start + needle.length);
		}
	}
	return ranges;
}

/** Replaces every match; returns how many were replaced. One undo step. */
export function replaceAll(
	editor: SlateEditor,
	search: string,
	replacement: string,
): number {
	const ranges = findRanges(editor, search);
	editor.tf.withoutNormalizing(() => {
		// Back to front so earlier offsets in the same leaf stay valid.
		for (const range of [...ranges].reverse())
			editor.tf.insertText(replacement, { at: range });
	});
	return ranges.length;
}
