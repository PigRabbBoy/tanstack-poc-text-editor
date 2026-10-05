/**
 * Ported from the Lexical playground (MIT, (c) Meta Platforms, Inc.):
 * nodes/StickyNode.tsx + nodes/StickyComponent.tsx @ v0.52.0.
 *
 * POC changes: notes are portaled into the nearest `[data-lexical-sticky-layer]`
 * ancestor of the editor root (positioned relative), so x/y are layer
 * coordinates and survive page scroll; no collaboration; Tailwind styling;
 * the nested caption editor inherits read-only from its parent.
 */
import {
	buildEditorFromExtensions,
	NestedEditorExtension,
} from "@lexical/extension";
import { SharedHistoryExtension } from "@lexical/history";
import { PlainTextExtension } from "@lexical/plain-text";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalExtensionEditorComposer } from "@lexical/react/LexicalExtensionEditorComposer";
import { ReactExtension } from "@lexical/react/ReactExtension";
import { ReactProviderExtension } from "@lexical/react/ReactProviderExtension";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { calculateZoomLevel } from "@lexical/utils";
import {
	$getDocument,
	$getNodeByKey,
	$getRoot,
	$setSelection,
	COMMAND_PRIORITY_EDITOR,
	configExtension,
	createCommand,
	DecoratorNode,
	defineExtension,
	enumValue,
	type LexicalCommand,
	type LexicalEditor,
	type LexicalEditorWithDispose,
	type LexicalNode,
	type NodeKey,
	nodeSchema,
	numberValue,
	rawValue,
	registerEventListeners,
	type SerializedEditor,
	type SerializedLexicalNode,
	type Spread,
	withAccessors,
} from "lexical";
import { Palette, X } from "lucide-react";
import { type JSX, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

export type StickyNoteColor = "pink" | "yellow";

export const INSERT_STICKY_COMMAND: LexicalCommand<void> = createCommand(
	"INSERT_STICKY_COMMAND",
);

export const STICKY_LAYER_ATTRIBUTE = "data-lexical-sticky-layer";

const stickyNodeSchema = nodeSchema<StickyNode>()({
	caption: withAccessors(rawValue<SerializedEditor>(), {
		getter: "getSerializedCaption",
	}),
	color: withAccessors(enumValue(["yellow", "pink"]), {
		getter: { field: "__color" },
	}),
	xOffset: withAccessors(numberValue(), { getter: { field: "__x" } }),
	yOffset: withAccessors(numberValue(), { getter: { field: "__y" } }),
});

export type SerializedStickyNode = Spread<
	{
		xOffset: number;
		yOffset: number;
		color: StickyNoteColor;
		caption: SerializedEditor;
	},
	SerializedLexicalNode
>;

const StickyEditorExtension = defineExtension({
	dependencies: [
		SharedHistoryExtension,
		PlainTextExtension,
		ReactProviderExtension,
		configExtension(NestedEditorExtension, {
			inheritEditableFromParent: true,
		}),
		configExtension(ReactExtension, {
			contentEditable: (
				<ContentEditable
					aria-label="Sticky note"
					className="min-h-6 cursor-text whitespace-pre-wrap break-words px-3 pb-3 font-heading text-lg leading-snug outline-none"
					aria-placeholder="What's up?"
					placeholder={
						<div className="pointer-events-none absolute start-3 top-8 select-none font-heading text-lg text-black/40">
							What's up?
						</div>
					}
				/>
			),
		}),
	],
	name: "@poc/lexical/playground/StickyEditor",
	namespace: "@poc/lexical/playground/StickyEditor",
	theme: { paragraph: "m-0" },
});

export class StickyNode extends DecoratorNode<JSX.Element> {
	__x: number;
	__y: number;
	__color: StickyNoteColor;
	__caption: LexicalEditorWithDispose;

	$config() {
		return this.config("sticky", {
			extends: DecoratorNode,
			json: stickyNodeSchema,
		});
	}

	static clone(node: StickyNode): StickyNode {
		return new StickyNode(
			node.__x,
			node.__y,
			node.__color,
			node.__caption,
			node.__key,
		);
	}

	/** @internal The nested caption editor's own serialized state. */
	getSerializedCaption(): SerializedEditor {
		return this.getLatest().__caption.toJSON();
	}

	setCaption(caption: SerializedEditor | undefined): this {
		const self = this.getWritable();
		if (caption) {
			const nestedEditor = self.__caption;
			const editorState = nestedEditor.parseEditorState(caption.editorState);
			if (!editorState.isEmpty()) {
				nestedEditor.setEditorState(editorState);
			}
		}
		return self;
	}

	setXOffset(xOffset: number): this {
		const self = this.getWritable();
		self.__x = xOffset;
		return self;
	}

	setYOffset(yOffset: number): this {
		const self = this.getWritable();
		self.__y = yOffset;
		return self;
	}

	setColor(color: StickyNoteColor): this {
		const self = this.getWritable();
		self.__color = color;
		return self;
	}

	constructor(
		x = 0,
		y = 0,
		color: StickyNoteColor = "yellow",
		caption?: LexicalEditorWithDispose,
		key?: NodeKey,
	) {
		super(key);
		this.__x = x;
		this.__y = y;
		this.__caption = caption || buildEditorFromExtensions(StickyEditorExtension);
		this.__color = color;
	}

	createDOM(): HTMLElement {
		const div = $getDocument().createElement("div");
		div.style.display = "contents";
		return div;
	}

	updateDOM(): false {
		return false;
	}

	setPosition(x: number, y: number): this {
		const writable = this.getWritable();
		writable.__x = x;
		writable.__y = y;
		$setSelection(null);
		return writable;
	}

	toggleColor(): this {
		const writable = this.getWritable();
		writable.__color = writable.__color === "pink" ? "yellow" : "pink";
		return writable;
	}

	decorate(editor: LexicalEditor): JSX.Element {
		return (
			<StickyPortal
				editor={editor}
				color={this.__color}
				x={this.__x}
				y={this.__y}
				nodeKey={this.getKey()}
				caption={this.__caption}
			/>
		);
	}

	isIsolated(): true {
		return true;
	}
}

export function $isStickyNode(
	node: LexicalNode | null | undefined,
): node is StickyNode {
	return node instanceof StickyNode;
}

export function $createStickyNode(xOffset: number, yOffset: number): StickyNode {
	return new StickyNode(xOffset, yOffset, "yellow");
}

function getStickyLayer(editor: LexicalEditor): HTMLElement | null {
	const root = editor.getRootElement();
	return root?.closest<HTMLElement>(`[${STICKY_LAYER_ATTRIBUTE}]`) ?? null;
}

function StickyPortal(props: StickyProps & { editor: LexicalEditor }) {
	const layer = getStickyLayer(props.editor);
	const note = <StickyComponent {...props} />;
	return layer === null ? note : createPortal(note, layer);
}

type StickyProps = {
	caption: LexicalEditorWithDispose;
	color: StickyNoteColor;
	nodeKey: NodeKey;
	x: number;
	y: number;
};

function StickyComponent({ x, y, nodeKey, color, caption }: StickyProps) {
	const [editor] = useLexicalComposerContext();
	const isEditable = useLexicalEditable();
	const containerRef = useRef<HTMLDivElement | null>(null);
	const dragCleanupRef = useRef<(() => void) | null>(null);
	const positionRef = useRef({
		isDragging: false,
		offsetX: 0,
		offsetY: 0,
		x,
		y,
	});

	useEffect(() => () => dragCleanupRef.current?.(), []);

	useEffect(() => {
		const position = positionRef.current;
		position.x = x;
		position.y = y;
		const container = containerRef.current;
		if (container !== null) {
			container.style.left = `${x}px`;
			container.style.top = `${y}px`;
		}
	}, [x, y]);

	const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
		const container = containerRef.current;
		const layer = container?.offsetParent;
		if (
			!isEditable ||
			container == null ||
			!(layer instanceof HTMLElement) ||
			event.button === 2 ||
			event.target !== event.currentTarget
		) {
			return;
		}
		const position = positionRef.current;
		const zoom = calculateZoomLevel(container);
		const rect = container.getBoundingClientRect();
		position.offsetX = event.clientX / zoom - rect.left;
		position.offsetY = event.clientY / zoom - rect.top;
		position.isDragging = true;
		container.classList.add("opacity-90", "shadow-xl");
		dragCleanupRef.current?.();
		dragCleanupRef.current = registerEventListeners(container.ownerDocument, {
			pointermove: (moveEvent: PointerEvent) => {
				if (!position.isDragging) {
					return;
				}
				const layerRect = layer.getBoundingClientRect();
				position.x = Math.max(
					0,
					moveEvent.clientX / zoom - position.offsetX - layerRect.left,
				);
				position.y = Math.max(
					0,
					moveEvent.clientY / zoom - position.offsetY - layerRect.top,
				);
				container.style.left = `${position.x}px`;
				container.style.top = `${position.y}px`;
			},
			pointerup: () => {
				position.isDragging = false;
				container.classList.remove("opacity-90", "shadow-xl");
				editor.update(() => {
					const node = $getNodeByKey(nodeKey);
					if ($isStickyNode(node)) {
						node.setPosition(
							Math.round(position.x),
							Math.round(position.y),
						);
					}
				});
				dragCleanupRef.current?.();
				dragCleanupRef.current = null;
			},
		});
		event.preventDefault();
	};

	const update = (fn: (node: StickyNode) => void) =>
		editor.update(() => {
			const node = $getNodeByKey(nodeKey);
			if ($isStickyNode(node)) {
				fn(node);
			}
		});

	return (
		<div
			ref={containerRef}
			className="absolute z-[9] w-44"
			style={{ left: x, top: y }}
			data-testid="sticky-note"
		>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: drag handle */}
			<div
				className={cn(
					"relative min-h-28 cursor-move rounded-sm pt-7 shadow-md ring-1 ring-black/5",
					color === "pink" ? "bg-pink-200" : "bg-yellow-100",
				)}
				onPointerDown={onPointerDown}
			>
				{isEditable && (
					<div className="absolute end-1 top-1 flex gap-0.5">
						<button
							type="button"
							onClick={() => update((node) => node.toggleColor())}
							className="rounded p-1 text-black/50 hover:bg-black/10 hover:text-black"
							aria-label="Change sticky note color"
							title="Color"
						>
							<Palette className="size-3.5" />
						</button>
						<button
							type="button"
							onClick={() => update((node) => node.remove())}
							className="rounded p-1 text-black/50 hover:bg-black/10 hover:text-black"
							aria-label="Delete sticky note"
							title="Delete"
						>
							<X className="size-3.5" />
						</button>
					</div>
				)}
				<LexicalExtensionEditorComposer initialEditor={caption} />
			</div>
		</div>
	);
}

/** Registers the node and an insert command that drops a note near the top of the layer. */
export const StickyExtension = defineExtension({
	name: "@poc/lexical/playground/Sticky",
	nodes: () => [StickyNode],
	register: (editor) =>
		editor.registerCommand(
			INSERT_STICKY_COMMAND,
			() => {
				const layer = getStickyLayer(editor);
				const root = $getRoot();
				const count = root.getChildren().filter($isStickyNode).length;
				const x = Math.max(16, (layer?.clientWidth ?? 600) - 220 - count * 24);
				const y = 16 + count * 24;
				root.append($createStickyNode(x, y));
				return true;
			},
			COMMAND_PRIORITY_EDITOR,
		),
});
