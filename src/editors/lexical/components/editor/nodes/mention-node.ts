// Vendored from @shadcn-editor/editor-x (MIT) and adapted for the POC:
// the node carries a user id and exports the shared mention convention
// `<span data-type="mention" data-id="u1">@Label</span>`.
import {
	$applyNodeReplacement,
	$getDocument,
	addClassNamesToElement,
	type DOMConversionMap,
	type DOMConversionOutput,
	type DOMExportOutput,
	type EditorConfig,
	type LexicalNode,
	type LexicalUpdateJSON,
	type NodeKey,
	type SerializedTextNode,
	type Spread,
	TextNode,
} from "lexical";

export const MENTION_CLASS_NAME =
	"editor-mention rounded-sm bg-accent px-1 font-medium text-primary-text";

export type SerializedMentionNode = Spread<
	{ mentionName: string; mentionId: string },
	SerializedTextNode
>;

export class MentionNode extends TextNode {
	/** Display label without the leading "@". */
	__mention: string;
	__mentionId: string;

	constructor(
		mentionName: string = "",
		text?: string,
		key?: NodeKey,
		mentionId: string = "",
	) {
		super(text ?? `@${mentionName}`, key);
		this.__mention = mentionName;
		this.__mentionId = mentionId;
	}

	$config() {
		return this.config("mention", { extends: TextNode });
	}

	afterCloneFrom(prevNode: this): void {
		super.afterCloneFrom(prevNode);
		this.__mention = prevNode.__mention;
		this.__mentionId = prevNode.__mentionId;
	}

	createDOM(config: EditorConfig): HTMLElement {
		const dom = super.createDOM(config);
		addClassNamesToElement(dom, MENTION_CLASS_NAME);
		dom.setAttribute("data-type", "mention");
		dom.setAttribute("data-id", this.__mentionId);
		dom.spellcheck = false;
		return dom;
	}

	exportDOM(): DOMExportOutput {
		const element = $getDocument().createElement("span");
		element.setAttribute("data-type", "mention");
		element.setAttribute("data-id", this.__mentionId);
		element.textContent = `@${this.__mention}`;
		return { element };
	}

	static importDOM(): DOMConversionMap | null {
		return {
			span: (domNode: HTMLElement) => {
				if (
					domNode.getAttribute("data-type") !== "mention" &&
					!domNode.hasAttribute("data-lexical-mention")
				) {
					return null;
				}
				return {
					conversion: $convertMentionElement,
					priority: 1,
				};
			},
		};
	}

	setMention(mentionName: string): this {
		const self = this.getWritable();
		self.__mention = mentionName;
		return self;
	}

	getMention(): string {
		return this.getLatest().__mention;
	}

	setMentionId(mentionId: string): this {
		const self = this.getWritable();
		self.__mentionId = mentionId;
		return self;
	}

	getMentionId(): string {
		return this.getLatest().__mentionId;
	}

	updateFromJSON(
		serializedNode: LexicalUpdateJSON<SerializedMentionNode>,
	): this {
		return super
			.updateFromJSON(serializedNode)
			.setMention(serializedNode.mentionName)
			.setMentionId(serializedNode.mentionId ?? "");
	}

	exportJSON(): SerializedMentionNode {
		return {
			...super.exportJSON(),
			mentionName: this.__mention,
			mentionId: this.__mentionId,
		};
	}

	isTextEntity(): true {
		return true;
	}

	canInsertTextBefore(): boolean {
		return false;
	}

	canInsertTextAfter(): boolean {
		return false;
	}
}

function $convertMentionElement(domNode: HTMLElement): DOMConversionOutput {
	const textContent = domNode.textContent ?? "";
	const label = textContent.replace(/^@/, "");
	const mentionName =
		domNode.getAttribute("data-lexical-mention-name") ?? label;
	const mentionId = domNode.getAttribute("data-id") ?? "";
	return { node: $createMentionNode(mentionName, mentionId) };
}

export function $isMentionNode(
	node: LexicalNode | null | undefined,
): node is MentionNode {
	return node instanceof MentionNode;
}

export function $createMentionNode(
	mentionName: string,
	mentionId: string = "",
): MentionNode {
	const node = new MentionNode(
		mentionName,
		`@${mentionName}`,
		undefined,
		mentionId,
	);
	node.setMode("segmented").toggleDirectionless();
	return $applyNodeReplacement(node);
}
