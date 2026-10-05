/**
 * Ported from the Lexical playground (MIT, (c) Meta Platforms, Inc.) @ v0.52.0:
 * plugins/TypingPerfPlugin, plugins/PasteLogPlugin, plugins/TreeViewPlugin,
 * plugins/DocsPlugin, plugins/ContextMenuPlugin (official NodeContextMenuPlugin).
 *
 * POC changes: TypingPerf reports into React state instead of the playground's
 * flash message; PasteLog is always active while mounted; Tailwind styling.
 */
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	NodeContextMenuOption,
	NodeContextMenuPlugin,
	NodeContextMenuSeparator,
} from "@lexical/react/LexicalNodeContextMenuPlugin";
import { TreeView } from "@lexical/react/LexicalTreeView";
import { TreeViewExtension } from "@lexical/react/TreeViewExtension";
import { useOptionalExtensionDependency } from "@lexical/react/useExtensionComponent";
import {
	$getSelection,
	$isDecoratorNode,
	$isNodeSelection,
	$isRangeSelection,
	COMMAND_PRIORITY_NORMAL,
	COPY_COMMAND,
	CUT_COMMAND,
	type LexicalNode,
	PASTE_COMMAND,
	type PasteCommandType,
	registerEventListeners,
} from "lexical";
import { useEffect, useMemo, useState } from "react";

const VALID_INPUT_TYPES = new Set([
	"insertText",
	"insertCompositionText",
	"insertFromComposition",
	"insertLineBreak",
	"insertParagraph",
	"deleteCompositionText",
	"deleteContentBackward",
	"deleteByComposition",
	"deleteContent",
	"deleteContentForward",
	"deleteWordBackward",
	"deleteWordForward",
	"deleteHardLineBackward",
	"deleteSoftLineBackward",
	"deleteHardLineForward",
	"deleteSoftLineForward",
]);

/** Measures beforeinput → next task latency and reports the 2 s average. */
export function TypingPerfPlugin({
	onReport,
}: {
	onReport: (text: string) => void;
}): null {
	useEffect(() => {
		let start = 0;
		let timerId: ReturnType<typeof setTimeout> | null = null;
		let keyPressTimerId: ReturnType<typeof setTimeout> | null = null;
		let log: number[] = [];
		let invalidatingEvent = false;

		const measureEventEnd = () => {
			if (keyPressTimerId != null) {
				if (invalidatingEvent) {
					invalidatingEvent = false;
				} else {
					log.push(performance.now() - start);
				}
				clearTimeout(keyPressTimerId);
				keyPressTimerId = null;
			}
		};

		const measureEventStart = () => {
			if (timerId != null) {
				clearTimeout(timerId);
				timerId = null;
			}
			keyPressTimerId = setTimeout(measureEventEnd, 0);
			timerId = setTimeout(() => {
				const total = log.reduce((a, b) => a + b, 0);
				if (log.length > 0) {
					onReport(
						`Typing perf: ${Math.round((total / log.length) * 100) / 100} ms per input (${log.length} samples)`,
					);
				}
				log = [];
			}, 2000);
			start = performance.now();
		};

		return registerEventListeners(
			window,
			{
				beforeinput: (event: InputEvent) => {
					if (!VALID_INPUT_TYPES.has(event.inputType) || invalidatingEvent) {
						invalidatingEvent = false;
						return;
					}
					measureEventStart();
				},
				cut: () => {
					invalidatingEvent = true;
				},
				keydown: (event: KeyboardEvent) => {
					if (event.key === "Backspace" || event.key === "Enter") {
						measureEventStart();
					}
				},
				paste: () => {
					invalidatingEvent = true;
				},
				selectionchange: measureEventEnd,
			},
			true,
		);
	}, [onReport]);

	return null;
}

/** Shows every MIME type of the last paste. */
export function PasteLogPlugin() {
	const [editor] = useLexicalComposerContext();
	const [lastClipboardData, setLastClipboardData] = useState<string | null>(
		null,
	);

	useEffect(
		() =>
			editor.registerCommand(
				PASTE_COMMAND,
				(event: PasteCommandType) => {
					if ("clipboardData" in event) {
						const { clipboardData } = event;
						const allData: string[] = [];
						for (const type of clipboardData?.types ?? []) {
							allData.push(type.toUpperCase(), clipboardData?.getData(type) ?? "");
						}
						setLastClipboardData(allData.join("\n\n"));
					}
					return false;
				},
				COMMAND_PRIORITY_NORMAL,
			),
		[editor],
	);

	return (
		<pre
			className="max-h-48 overflow-auto whitespace-pre-wrap rounded-md border bg-muted/40 p-2 font-mono text-[11px]"
			data-testid="paste-log"
		>
			{lastClipboardData ?? "Paste something into the editor to log its clipboard data."}
		</pre>
	);
}

const TREE_BUTTON =
	"rounded border bg-background px-2 py-0.5 text-xs text-foreground hover:bg-muted";

/** TreeViewExtension config: the official @lexical/react TreeView (debug view with time travel). */
export const TreeViewConfig = {
	viewClassName:
		"max-h-80 overflow-auto whitespace-pre rounded-md bg-neutral-900 p-3 font-mono text-[11px] leading-snug text-neutral-100",
	treeTypeButtonClassName: TREE_BUTTON,
	timeTravelPanelClassName: "mt-2 flex items-center gap-2",
	timeTravelButtonClassName: TREE_BUTTON,
	timeTravelPanelSliderClassName: "flex-1",
	timeTravelPanelButtonClassName: TREE_BUTTON,
};

/** Renders TreeViewExtension's output component (falls back to <TreeView>). */
export function TreeViewPlugin() {
	const [editor] = useLexicalComposerContext();
	const treeView = useOptionalExtensionDependency(TreeViewExtension);
	const Component = treeView?.output.Component;
	return (
		<div data-testid="tree-view" className="lexical-tree-view">
			{Component ? (
				<Component />
			) : (
				<TreeView {...TreeViewConfig} editor={editor} />
			)}
		</div>
	);
}

/** The playground's ContextMenuPlugin, built on the official NodeContextMenuPlugin. */
export function LexicalNodeContextMenu() {
	const [editor] = useLexicalComposerContext();

	const items = useMemo(
		() => [
			new NodeContextMenuOption("Remove link", {
				$onSelect: () => editor.dispatchCommand(TOGGLE_LINK_COMMAND, null),
				$showOn: (node: LexicalNode) => $isLinkNode(node.getParent()),
			}),
			new NodeContextMenuSeparator({
				$showOn: (node: LexicalNode) => $isLinkNode(node.getParent()),
			}),
			new NodeContextMenuOption("Cut", {
				$onSelect: () => editor.dispatchCommand(CUT_COMMAND, null),
			}),
			new NodeContextMenuOption("Copy", {
				$onSelect: () => editor.dispatchCommand(COPY_COMMAND, null),
			}),
			new NodeContextMenuOption("Paste", {
				$onSelect: () => {
					navigator.clipboard.read().then(async ([item]) => {
						if (!item) {
							return;
						}
						const data = new DataTransfer();
						for (const type of item.types) {
							data.setData(type, await (await item.getType(type)).text());
						}
						editor.dispatchCommand(
							PASTE_COMMAND,
							new ClipboardEvent("paste", { clipboardData: data }),
						);
					});
				},
			}),
			new NodeContextMenuOption("Paste as plain text", {
				$onSelect: () => {
					navigator.clipboard.readText().then((text) => {
						const data = new DataTransfer();
						data.setData("text/plain", text);
						editor.dispatchCommand(
							PASTE_COMMAND,
							new ClipboardEvent("paste", { clipboardData: data }),
						);
					});
				},
			}),
			new NodeContextMenuSeparator(),
			new NodeContextMenuOption("Delete node", {
				$onSelect: () => {
					const selection = $getSelection();
					if ($isNodeSelection(selection)) {
						for (const node of selection.getNodes()) {
							if ($isDecoratorNode(node)) {
								node.remove();
							}
						}
					} else if ($isRangeSelection(selection)) {
						selection.anchor.getNode().getTopLevelElement()?.remove();
					}
				},
			}),
		],
		[editor],
	);

	return (
		<NodeContextMenuPlugin
			className="z-50 min-w-44 rounded-lg bg-popover p-1 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none"
			itemClassName="flex w-full cursor-default items-center rounded-md px-2 py-1 text-start outline-none hover:bg-accent focus:bg-accent"
			separatorClassName="my-1 h-px bg-border"
			items={items}
		/>
	);
}
