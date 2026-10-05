/**
 * Ported from the Lexical playground (MIT, (c) Meta Platforms, Inc.):
 * nodes/PageBreakNode + plugins/PageBreakExtension @ v0.52.0.
 * Styled with Tailwind instead of the playground CSS.
 */
import { defineImportRule, DOMImportExtension, sel } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { $insertNodeToNearestRoot } from "@lexical/utils";
import {
	$getDocument,
	$getSelection,
	$isRangeSelection,
	CLICK_COMMAND,
	COMMAND_PRIORITY_EDITOR,
	COMMAND_PRIORITY_LOW,
	configExtension,
	createCommand,
	DecoratorNode,
	defineExtension,
	type DOMExportOutput,
	type LexicalCommand,
	type LexicalNode,
	type NodeKey,
} from "lexical";
import { type JSX, useEffect } from "react";

export const INSERT_PAGE_BREAK: LexicalCommand<void> = createCommand(
	"INSERT_PAGE_BREAK",
);

const BASE_CLASS =
	"lexical-page-break relative my-6 block h-px cursor-pointer overflow-visible border-0 border-t-2 border-dashed border-border";

function PageBreakComponent({ nodeKey }: { nodeKey: NodeKey }) {
	const [editor] = useLexicalComposerContext();
	const [isSelected, setSelected, clearSelection] =
		useLexicalNodeSelection(nodeKey);

	useEffect(
		() =>
			editor.registerCommand(
				CLICK_COMMAND,
				(event: MouseEvent) => {
					const element = editor.getElementByKey(nodeKey);
					if (event.target === element) {
						if (!event.shiftKey) {
							clearSelection();
						}
						setSelected(!isSelected);
						return true;
					}
					return false;
				},
				COMMAND_PRIORITY_LOW,
			),
		[clearSelection, editor, isSelected, nodeKey, setSelected],
	);

	useEffect(() => {
		const element = editor.getElementByKey(nodeKey);
		if (element !== null) {
			element.className = `${BASE_CLASS}${isSelected ? " selected border-primary" : ""}`;
		}
	}, [editor, isSelected, nodeKey]);

	return null;
}

export class PageBreakNode extends DecoratorNode<JSX.Element> {
	$config() {
		return this.config("page-break", { extends: DecoratorNode });
	}

	createDOM(): HTMLElement {
		const element = $getDocument().createElement("hr");
		element.style.pageBreakAfter = "always";
		element.setAttribute("data-lexical-page-break", "true");
		element.className = BASE_CLASS;
		return element;
	}

	exportDOM(): DOMExportOutput {
		const element = $getDocument().createElement("hr");
		element.style.pageBreakAfter = "always";
		element.setAttribute("data-lexical-page-break", "true");
		return { element };
	}

	getTextContent(): string {
		return "\n";
	}

	isInline(): false {
		return false;
	}

	updateDOM(): boolean {
		return false;
	}

	decorate(): JSX.Element {
		return <PageBreakComponent nodeKey={this.__key} />;
	}
}

export function $createPageBreakNode(): PageBreakNode {
	return new PageBreakNode();
}

export function $isPageBreakNode(
	node: LexicalNode | null | undefined,
): node is PageBreakNode {
	return node instanceof PageBreakNode;
}

const PageBreakImportRule = defineImportRule({
	$import: () => [$createPageBreakNode()],
	match: sel.tag("hr").attr("data-lexical-page-break", "true"),
	name: "@poc/lexical/page-break",
});

export const PageBreakExtension = defineExtension({
	dependencies: [
		configExtension(DOMImportExtension, { rules: [PageBreakImportRule] }),
	],
	name: "@poc/lexical/playground/PageBreak",
	nodes: () => [PageBreakNode],
	register: (editor) =>
		editor.registerCommand(
			INSERT_PAGE_BREAK,
			() => {
				const selection = $getSelection();
				if (!$isRangeSelection(selection)) {
					return false;
				}
				$insertNodeToNearestRoot($createPageBreakNode());
				return true;
			},
			COMMAND_PRIORITY_EDITOR,
		),
});
