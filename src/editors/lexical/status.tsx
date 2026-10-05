import { EditorStateExtension } from "@lexical/extension";
import { $createOffsetView } from "@lexical/offset";
import { $isOverflowNode } from "@lexical/overflow";
import { CharacterLimitPlugin } from "@lexical/react/LexicalCharacterLimitPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useExtensionDependency } from "@lexical/react/useExtensionComponent";
import { $rootTextContent } from "@lexical/text";
import { $dfs, $unwrapNode } from "@lexical/utils";
import { $getSelection, $isRangeSelection } from "lexical";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Offsets = { range: [number, number]; total: number } | null;

/**
 * Caret offsets from @lexical/offset (the character index model used by
 * collaboration diffs), recomputed whenever the EditorStateExtension signal
 * changes. Subscribed with plain state (not useSignalValue): a synchronous
 * store re-render here loops with TreeView + CharacterLimit updates.
 */
export function CaretOffsetStatus() {
	const [editor] = useLexicalComposerContext();
	const signal = useExtensionDependency(EditorStateExtension).output;
	const [offsets, setOffsets] = useState<Offsets>(null);

	useEffect(
		() =>
			signal.subscribe((editorState) => {
				setOffsets(
					editorState.read((): Offsets => {
						const selection = $getSelection();
						if (!$isRangeSelection(selection)) return null;
						const view = $createOffsetView(editor, 1, editorState);
						return {
							range: view.getOffsetsFromSelection(selection),
							total: $rootTextContent().length,
						};
					}),
				);
			}),
		[editor, signal],
	);

	if (offsets === null) return null;
	const [start, end] = offsets.range;
	return (
		<span
			title="Caret offset from @lexical/offset (OffsetView)"
			data-testid="caret-offset"
		>
			offset {start === end ? start : `${start}–${end}`} / {offsets.total}
		</span>
	);
}

/**
 * Official CharacterLimitPlugin (wraps overflow in OverflowNode) with a
 * remaining-characters badge; unwraps the overflow when switched off.
 */
export function CharacterLimit({
	charset,
	maxLength,
}: {
	charset: "UTF-8" | "UTF-16";
	maxLength: number;
}) {
	const [editor] = useLexicalComposerContext();

	useEffect(
		() => () => {
			editor.update(() => {
				for (const { node } of $dfs()) {
					if ($isOverflowNode(node)) $unwrapNode(node);
				}
			});
		},
		[editor],
	);

	return (
		<CharacterLimitPlugin
			charset={charset}
			maxLength={maxLength}
			renderer={({ remainingCharacters }) => (
				<span
					className={cn(
						"rounded px-1.5 font-medium tabular-nums",
						remainingCharacters < 0
							? "bg-destructive/10 text-destructive"
							: "bg-muted text-foreground",
					)}
					data-testid="character-limit"
					title={`${charset} character limit ${maxLength}`}
				>
					{remainingCharacters}
				</span>
			)}
		/>
	);
}
