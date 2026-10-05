import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer";
import { defineExtension } from "lexical";
import { useEffect, useMemo, useRef } from "react";
import { STICKY_LAYER_ATTRIBUTE } from "@/editors/lexical/components/playground/sticky";
import type { RenderedProps } from "@/editors/types";
import { CONTENT_EXTENSIONS } from "./extensions";
import { editorTheme } from "./theme";

/** Swaps the read-only editor's state when a new snapshot arrives (no remount). */
function SyncStatePlugin({ json }: RenderedProps) {
	const [editor] = useLexicalComposerContext();
	const first = useRef(true);

	useEffect(() => {
		if (first.current) {
			first.current = false;
			return;
		}
		try {
			editor.setEditorState(editor.parseEditorState(JSON.stringify(json)));
		} catch (error) {
			console.error(error);
		}
	}, [editor, json]);

	return null;
}

/** A second Lexical editor with `editable: false`, the same nodes and theme. */
export default function Rendered({ json }: RenderedProps) {
	// Created once; later snapshots go through SyncStatePlugin.
	// biome-ignore lint/correctness/useExhaustiveDependencies: initial state only
	const extension = useMemo(
		() =>
			defineExtension({
				name: "@poc/lexical/rendered",
				namespace: "poc-lexical-rendered",
				dependencies: CONTENT_EXTENSIONS,
				theme: editorTheme,
				editable: false,
				$initialEditorState: JSON.stringify(json),
				onError: (error: Error) => {
					console.error(error);
				},
			}),
		[],
	);

	return (
		<LexicalExtensionComposer
			extension={extension}
			contentEditable={
				<div className="relative" {...{ [STICKY_LAYER_ATTRIBUTE]: "" }}>
					<ContentEditable
						className="text-base leading-7 outline-none"
						aria-label="Rendered document"
						data-testid="lexical-rendered"
					/>
				</div>
			}
		>
			<SyncStatePlugin json={json} />
		</LexicalExtensionComposer>
	);
}
