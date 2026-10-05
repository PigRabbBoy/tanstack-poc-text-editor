/**
 * Ported from the Lexical playground (MIT, (c) Meta Platforms, Inc.):
 * nodes/InlineImageNode/* + plugins/InlineImagePlugin @ v0.35.0 (the node was
 * dropped from later playground versions; the API it uses still exists in 0.52).
 *
 * POC changes: files go through fileToDataUrl (1 MB cap), shadcn dialog,
 * no importDOM for <img> (the registry ImageNode owns that), and the caption is
 * a LexicalNestedComposer with the legacy RichTextPlugin/AutoFocusPlugin.
 */
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { LexicalNestedComposer } from "@lexical/react/LexicalNestedComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import {
	$wrapNodeInElement,
	addClassNamesToElement,
	removeClassNamesFromElement,
} from "@lexical/utils";
import {
	$applyNodeReplacement,
	$createParagraphNode,
	$getDocument,
	$getNodeByKey,
	$insertNodes,
	$isRootOrShadowRoot,
	CLICK_COMMAND,
	COMMAND_PRIORITY_EDITOR,
	COMMAND_PRIORITY_LOW,
	createCommand,
	createEditor,
	DecoratorNode,
	defineExtension,
	type DOMExportOutput,
	type EditorConfig,
	type LexicalCommand,
	type LexicalEditor,
	type LexicalNode,
	type LexicalUpdateJSON,
	mergeRegister,
	type NodeKey,
	type SerializedEditor,
	type SerializedLexicalNode,
	type Spread,
} from "lexical";
import { Pencil } from "lucide-react";
import { type JSX, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/editors/lexical/ui/button";
import { Checkbox } from "@/editors/lexical/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/editors/lexical/ui/dialog";
import { Input } from "@/editors/lexical/ui/input";
import { Label } from "@/editors/lexical/ui/label";
import { fileToDataUrl } from "@/lib/image";
import { cn } from "@/lib/utils";

export type Position = "left" | "right" | "full" | undefined;

export interface InlineImagePayload {
	altText: string;
	caption?: LexicalEditor;
	height?: number;
	key?: NodeKey;
	showCaption?: boolean;
	src: string;
	width?: number;
	position?: Position;
}

export type SerializedInlineImageNode = Spread<
	{
		altText: string;
		caption: SerializedEditor;
		height?: number;
		showCaption: boolean;
		src: string;
		width?: number;
		position?: Position;
	},
	SerializedLexicalNode
>;

export const INSERT_INLINE_IMAGE_COMMAND: LexicalCommand<InlineImagePayload> =
	createCommand("INSERT_INLINE_IMAGE_COMMAND");

/** Opens the insert dialog (rendered by InlineImagePlugin). */
export const OPEN_INLINE_IMAGE_DIALOG_COMMAND: LexicalCommand<void> =
	createCommand("OPEN_INLINE_IMAGE_DIALOG_COMMAND");

const POSITION_CLASSES: Record<NonNullable<Position>, string> = {
	left: "float-left me-3 mb-1",
	right: "float-right ms-3 mb-1",
	full: "block w-full my-2",
};

function positionClass(position: Position): string | undefined {
	return position ? POSITION_CLASSES[position] : undefined;
}

export class InlineImageNode extends DecoratorNode<JSX.Element> {
	__src: string;
	__altText: string;
	__width: "inherit" | number;
	__height: "inherit" | number;
	__showCaption: boolean;
	__caption: LexicalEditor;
	__position: Position;

	static getType(): string {
		return "inline-image";
	}

	static clone(node: InlineImageNode): InlineImageNode {
		return new InlineImageNode(
			node.__src,
			node.__altText,
			node.__position,
			node.__width,
			node.__height,
			node.__showCaption,
			node.__caption,
			node.__key,
		);
	}

	static importJSON(serializedNode: SerializedInlineImageNode): InlineImageNode {
		const { altText, height, width, src, showCaption, position } =
			serializedNode;
		return $createInlineImageNode({
			altText,
			height,
			position,
			showCaption,
			src,
			width,
		}).updateFromJSON(serializedNode);
	}

	updateFromJSON(
		serializedNode: LexicalUpdateJSON<SerializedInlineImageNode>,
	): this {
		const { caption } = serializedNode;
		const node = super.updateFromJSON(serializedNode);
		if (caption) {
			const nestedEditor = node.__caption;
			const editorState = nestedEditor.parseEditorState(caption.editorState);
			if (!editorState.isEmpty()) {
				nestedEditor.setEditorState(editorState);
			}
		}
		return node;
	}

	constructor(
		src: string,
		altText: string,
		position: Position,
		width?: "inherit" | number,
		height?: "inherit" | number,
		showCaption?: boolean,
		caption?: LexicalEditor,
		key?: NodeKey,
	) {
		super(key);
		this.__src = src;
		this.__altText = altText;
		this.__width = width || "inherit";
		this.__height = height || "inherit";
		this.__showCaption = showCaption || false;
		this.__caption = caption || createEditor();
		this.__position = position;
	}

	exportDOM(): DOMExportOutput {
		const element = $getDocument().createElement("img");
		element.setAttribute("src", this.__src);
		element.setAttribute("alt", this.__altText);
		element.setAttribute("data-position", this.__position ?? "left");
		if (this.__width !== "inherit") {
			element.setAttribute("width", String(this.__width));
		}
		if (this.__height !== "inherit") {
			element.setAttribute("height", String(this.__height));
		}
		return { element };
	}

	exportJSON(): SerializedInlineImageNode {
		return {
			...super.exportJSON(),
			altText: this.getAltText(),
			caption: this.__caption.toJSON(),
			height: this.__height === "inherit" ? 0 : this.__height,
			position: this.__position,
			showCaption: this.__showCaption,
			src: this.getSrc(),
			width: this.__width === "inherit" ? 0 : this.__width,
		};
	}

	getSrc(): string {
		return this.__src;
	}

	getAltText(): string {
		return this.__altText;
	}

	getShowCaption(): boolean {
		return this.__showCaption;
	}

	getPosition(): Position {
		return this.__position;
	}

	update(payload: {
		altText?: string;
		showCaption?: boolean;
		position?: Position;
	}): void {
		const writable = this.getWritable();
		if (payload.altText !== undefined) {
			writable.__altText = payload.altText;
		}
		if (payload.showCaption !== undefined) {
			writable.__showCaption = payload.showCaption;
		}
		if (payload.position !== undefined) {
			writable.__position = payload.position;
		}
	}

	createDOM(config: EditorConfig): HTMLElement {
		const span = $getDocument().createElement("span");
		for (const className of [
			config.theme.inlineImage,
			positionClass(this.__position),
		]) {
			if (className) {
				addClassNamesToElement(span, className);
			}
		}
		return span;
	}

	updateDOM(prevNode: this, dom: HTMLElement): false {
		if (this.__position !== prevNode.__position) {
			removeClassNamesFromElement(dom, positionClass(prevNode.__position));
			addClassNamesToElement(dom, positionClass(this.__position));
		}
		return false;
	}

	decorate(): JSX.Element {
		return (
			<InlineImageComponent
				src={this.__src}
				altText={this.__altText}
				width={this.__width}
				height={this.__height}
				nodeKey={this.getKey()}
				showCaption={this.__showCaption}
				caption={this.__caption}
				position={this.__position}
			/>
		);
	}
}

export function $createInlineImageNode({
	altText,
	position,
	height,
	src,
	width,
	showCaption,
	caption,
	key,
}: InlineImagePayload): InlineImageNode {
	return $applyNodeReplacement(
		new InlineImageNode(
			src,
			altText,
			position,
			width,
			height,
			showCaption,
			caption,
			key,
		),
	);
}

export function $isInlineImageNode(
	node: LexicalNode | null | undefined,
): node is InlineImageNode {
	return node instanceof InlineImageNode;
}

function ImageOptions({
	altText,
	setAltText,
	position,
	setPosition,
	showCaption,
	setShowCaption,
}: {
	altText: string;
	setAltText: (value: string) => void;
	position: Position;
	setPosition: (value: Position) => void;
	showCaption: boolean;
	setShowCaption: (value: boolean) => void;
}) {
	return (
		<>
			<div className="grid gap-1.5">
				<Label htmlFor="inline-image-alt">Alt text</Label>
				<Input
					id="inline-image-alt"
					placeholder="Descriptive alternative text"
					value={altText}
					onChange={(event) => setAltText(event.target.value)}
				/>
			</div>
			<div className="grid gap-1.5">
				<Label htmlFor="inline-image-position">Position</Label>
				<select
					id="inline-image-position"
					className="h-8 rounded-lg border bg-background px-2 text-sm"
					value={position}
					onChange={(event) => setPosition(event.target.value as Position)}
				>
					<option value="left">Left (text wraps right)</option>
					<option value="right">Right (text wraps left)</option>
					<option value="full">Full width</option>
				</select>
			</div>
			<Label className="flex items-center gap-2">
				<Checkbox
					checked={showCaption}
					onCheckedChange={(checked) => setShowCaption(checked === true)}
				/>
				Show caption (a nested editor)
			</Label>
		</>
	);
}

function UpdateInlineImageDialog({
	nodeKey,
	open,
	onOpenChange,
}: {
	nodeKey: NodeKey;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [editor] = useLexicalComposerContext();
	const node = editor
		.getEditorState()
		.read(() => $getNodeByKey(nodeKey) as InlineImageNode | null);
	const [altText, setAltText] = useState(node?.getAltText() ?? "");
	const [showCaption, setShowCaption] = useState(
		node?.getShowCaption() ?? false,
	);
	const [position, setPosition] = useState<Position>(
		node?.getPosition() ?? "left",
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Update inline image</DialogTitle>
				</DialogHeader>
				<ImageOptions
					altText={altText}
					setAltText={setAltText}
					position={position}
					setPosition={setPosition}
					showCaption={showCaption}
					setShowCaption={setShowCaption}
				/>
				<DialogFooter>
					<Button
						onClick={() => {
							editor.update(() => {
								const latest = $getNodeByKey(nodeKey);
								if ($isInlineImageNode(latest)) {
									latest.update({ altText, position, showCaption });
								}
							});
							onOpenChange(false);
						}}
					>
						Confirm
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function InlineImageComponent({
	src,
	altText,
	nodeKey,
	width,
	height,
	showCaption,
	caption,
	position,
}: {
	altText: string;
	caption: LexicalEditor;
	height: "inherit" | number;
	nodeKey: NodeKey;
	showCaption: boolean;
	src: string;
	width: "inherit" | number;
	position: Position;
}) {
	const imageRef = useRef<null | HTMLImageElement>(null);
	const [isSelected, setSelected, clearSelection] =
		useLexicalNodeSelection(nodeKey);
	const [editor] = useLexicalComposerContext();
	const isEditable = useLexicalEditable();
	const [dialogOpen, setDialogOpen] = useState(false);

	useEffect(
		() =>
			mergeRegister(
				editor.registerCommand<MouseEvent>(
					CLICK_COMMAND,
					(event) => {
						if (event.target === imageRef.current) {
							if (event.shiftKey) {
								setSelected(!isSelected);
							} else {
								clearSelection();
								setSelected(true);
							}
							return true;
						}
						return false;
					},
					COMMAND_PRIORITY_LOW,
				),
			),
		[clearSelection, editor, isSelected, setSelected],
	);

	const isFocused = isSelected && isEditable;

	return (
		<>
			<span className="group/inline-image relative inline-block max-w-full">
				{isEditable && (
					<button
						type="button"
						className="absolute end-1 top-1 z-[1] inline-flex items-center gap-1 rounded bg-background/90 px-1.5 py-0.5 text-[11px] opacity-0 shadow-sm ring-1 ring-border transition-opacity group-hover/inline-image:opacity-100"
						onClick={() => setDialogOpen(true)}
						data-testid="inline-image-edit"
					>
						<Pencil className="size-3" /> Edit
					</button>
				)}
				<img
					ref={imageRef}
					src={src}
					alt={altText}
					data-position={position}
					data-testid="inline-image"
					draggable={false}
					className={cn(
						"block max-w-full rounded-sm",
						position === "full" ? "w-full" : "max-w-48",
						isFocused && "outline-2 outline-offset-2 outline-primary",
					)}
					style={{
						height: height === "inherit" || height === 0 ? undefined : height,
						width: width === "inherit" || width === 0 ? undefined : width,
					}}
				/>
			</span>
			{showCaption && (
				<span className="relative mt-1 block min-w-32 rounded-sm border border-dashed bg-muted/40 text-xs">
					<LexicalNestedComposer initialEditor={caption}>
						<AutoFocusPlugin />
						<RichTextPlugin
							contentEditable={
								<ContentEditable
									className="min-h-6 px-2 py-1 outline-none"
									aria-label="Image caption"
									aria-placeholder="Enter a caption…"
									placeholder={
										<span className="pointer-events-none absolute start-2 top-1 text-muted-foreground">
											Enter a caption…
										</span>
									}
								/>
							}
							ErrorBoundary={LexicalErrorBoundary}
						/>
					</LexicalNestedComposer>
				</span>
			)}
			{dialogOpen && (
				<UpdateInlineImageDialog
					nodeKey={nodeKey}
					open={dialogOpen}
					onOpenChange={setDialogOpen}
				/>
			)}
		</>
	);
}

/** Insert dialog: file (base64 ≤1 MB), alt text, position and caption. */
export function InsertInlineImageDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [editor] = useLexicalComposerContext();
	const [src, setSrc] = useState("");
	const [altText, setAltText] = useState("");
	const [showCaption, setShowCaption] = useState(false);
	const [position, setPosition] = useState<Position>("left");

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent data-testid="inline-image-dialog">
				<DialogHeader>
					<DialogTitle>Insert inline image</DialogTitle>
				</DialogHeader>
				<div className="grid gap-1.5">
					<Label htmlFor="inline-image-file">Image (max 1 MB)</Label>
					<Input
						id="inline-image-file"
						type="file"
						accept="image/*"
						onChange={(event) => {
							const file = event.target.files?.[0];
							if (!file) {
								return;
							}
							fileToDataUrl(file).then(setSrc, (error: unknown) => {
								toast.error(
									error instanceof Error ? error.message : "Could not read image",
								);
							});
							if (altText === "") {
								setAltText(file.name);
							}
						}}
					/>
				</div>
				<ImageOptions
					altText={altText}
					setAltText={setAltText}
					position={position}
					setPosition={setPosition}
					showCaption={showCaption}
					setShowCaption={setShowCaption}
				/>
				<DialogFooter>
					<Button
						disabled={src === ""}
						data-testid="inline-image-confirm"
						onClick={() => {
							editor.dispatchCommand(INSERT_INLINE_IMAGE_COMMAND, {
								altText,
								position,
								showCaption,
								src,
							});
							onOpenChange(false);
						}}
					>
						Insert
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export const InlineImageExtension = defineExtension({
	name: "@poc/lexical/playground/InlineImage",
	nodes: () => [InlineImageNode],
	register: (editor) =>
		editor.registerCommand(
			INSERT_INLINE_IMAGE_COMMAND,
			(payload) => {
				const imageNode = $createInlineImageNode(payload);
				$insertNodes([imageNode]);
				if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
					$wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
				}
				return true;
			},
			COMMAND_PRIORITY_EDITOR,
		),
});

/** Hosts the insert dialog; open it with OPEN_INLINE_IMAGE_DIALOG_COMMAND. */
export function InlineImagePlugin(): JSX.Element {
	const [editor] = useLexicalComposerContext();
	const [open, setOpen] = useState(false);

	useEffect(
		() =>
			editor.registerCommand(
				OPEN_INLINE_IMAGE_DIALOG_COMMAND,
				() => {
					setOpen(true);
					return true;
				},
				COMMAND_PRIORITY_EDITOR,
			),
		[editor],
	);

	return open ? (
		<InsertInlineImageDialog open={open} onOpenChange={setOpen} />
	) : (
		<></>
	);
}
