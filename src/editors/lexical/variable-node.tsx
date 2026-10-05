import {
	DecoratorTextExtension,
	DecoratorTextNode,
	type SerializedDecoratorTextNode,
} from "@lexical/extension";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import {
	$applyNodeReplacement,
	$getDocument,
	$getState,
	$insertNodes,
	$setState,
	COMMAND_PRIORITY_EDITOR,
	createCommand,
	createState,
	type DOMConversionMap,
	type DOMConversionOutput,
	type DOMExportOutput,
	defineExtension,
	IS_BOLD,
	IS_ITALIC,
	IS_STRIKETHROUGH,
	IS_UNDERLINE,
	type LexicalCommand,
	type LexicalNode,
	type NodeKey,
	type Spread,
} from "lexical";
import type { JSX } from "react";
import { VARIABLES } from "@/data/variables";
import { variableMarkdown } from "@/lib/conventions";
import { cn } from "@/lib/utils";

/** JSON shape: `name` and `format` are flat node-state keys. */
export type SerializedVariableNode = Spread<
	{ name: string },
	SerializedDecoratorTextNode
>;

const nameState = createState("name", {
	parse: (value) => (typeof value === "string" ? value : ""),
});

export const INSERT_VARIABLE_COMMAND: LexicalCommand<string> = createCommand(
	"INSERT_VARIABLE_COMMAND",
);

const FORMAT_CLASSES = [
	[IS_BOLD, "font-bold"],
	[IS_ITALIC, "italic"],
	[IS_STRIKETHROUGH, "line-through"],
	[IS_UNDERLINE, "underline"],
] as const;

/**
 * Atomic `{{name}}` template variable. A DecoratorTextNode is a DecoratorNode
 * that is inline and keeps a text format, so `**{{amount}}**` survives a
 * markdown round-trip.
 */
export class VariableNode extends DecoratorTextNode {
	$config() {
		return this.config("variable", {
			extends: DecoratorTextNode,
			stateConfigs: [{ flat: true, stateConfig: nameState }],
			importDOM: {
				span: (domNode: HTMLElement) =>
					domNode.getAttribute("data-type") === "variable"
						? { conversion: $convertVariableElement, priority: 2 }
						: null,
			} satisfies DOMConversionMap,
		});
	}

	getName(): string {
		return $getState(this, nameState);
	}

	setName(name: string): this {
		return $setState(this, nameState, name);
	}

	getTextContent(): string {
		return variableMarkdown(this.getName());
	}

	isKeyboardSelectable(): boolean {
		return true;
	}

	createDOM(): HTMLElement {
		const element = $getDocument().createElement("span");
		element.setAttribute("data-type", "variable");
		element.setAttribute("data-name", this.getName());
		element.className = "inline-block align-baseline";
		return element;
	}

	updateDOM(prevNode: this, dom: HTMLElement): boolean {
		if (prevNode.getName() !== this.getName()) {
			dom.setAttribute("data-name", this.getName());
		}
		return false;
	}

	exportDOM(): DOMExportOutput {
		const element = $getDocument().createElement("span");
		element.setAttribute("data-type", "variable");
		element.setAttribute("data-name", this.getName());
		element.textContent = variableMarkdown(this.getName());
		return { element };
	}

	decorate(): JSX.Element {
		return (
			<VariableChip
				name={this.getName()}
				format={this.getFormat()}
				nodeKey={this.getKey()}
			/>
		);
	}
}

function $convertVariableElement(domNode: HTMLElement): DOMConversionOutput {
	const name = domNode.getAttribute("data-name");
	return { node: name ? $createVariableNode(name) : null };
}

export function $createVariableNode(name: string): VariableNode {
	return $applyNodeReplacement(new VariableNode().setName(name));
}

export function $isVariableNode(
	node: LexicalNode | null | undefined,
): node is VariableNode {
	return node instanceof VariableNode;
}

function VariableChip({
	name,
	format,
	nodeKey,
}: {
	name: string;
	format: number;
	nodeKey: NodeKey;
}) {
	const [isSelected] = useLexicalNodeSelection(nodeKey);
	const known = VARIABLES.find((variable) => variable.name === name);
	return (
		<span
			className={cn(
				"rounded-sm bg-muted px-1.5 py-0.5 font-label text-[0.85em] font-semibold text-primary-text",
				!known && "outline outline-dashed outline-1 outline-destructive",
				isSelected && "ring-2 ring-ring",
				FORMAT_CLASSES.map(([flag, className]) => format & flag && className),
			)}
			title={
				known ? `${known.label} — e.g. ${known.sample}` : "Unknown variable"
			}
			data-testid="variable-chip"
		>
			{variableMarkdown(name)}
		</span>
	);
}

export const VariableExtension = defineExtension({
	name: "@poc/lexical/Variable",
	dependencies: [DecoratorTextExtension],
	nodes: () => [VariableNode],
	register: (editor) =>
		editor.registerCommand(
			INSERT_VARIABLE_COMMAND,
			(name) => {
				const node = $createVariableNode(name);
				$insertNodes([node]);
				node.selectNext();
				return true;
			},
			COMMAND_PRIORITY_EDITOR,
		),
});
