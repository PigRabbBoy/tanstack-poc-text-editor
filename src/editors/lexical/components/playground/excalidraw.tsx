/**
 * Ported from the Lexical playground (MIT, (c) Meta Platforms, Inc.):
 * nodes/ExcalidrawNode/*, plugins/ExcalidrawExtension, ui/ExcalidrawModal @ v0.52.0.
 *
 * POC changes: Excalidraw (and its CSS) is imported lazily the first time a
 * drawing is opened or rendered; the modal and resize handle use Tailwind and
 * the registry's shadcn buttons instead of the playground UI kit.
 */
import type {
	AppState,
	BinaryFiles,
	ExcalidrawImperativeAPI,
	ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types";
import { defineImportRule, DOMImportExtension, sel } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { useLexicalFocusTrapRef } from "@lexical/react/useLexicalFocusTrapRef";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { $wrapNodeInElement } from "@lexical/utils";
import {
	$createParagraphNode,
	$getDocument,
	$getNodeByKey,
	$insertNodes,
	$isRootOrShadowRoot,
	CLICK_COMMAND,
	COMMAND_PRIORITY_EDITOR,
	COMMAND_PRIORITY_LOW,
	configExtension,
	createCommand,
	DecoratorNode,
	defineExtension,
	type DOMExportOutput,
	type EditorConfig,
	enumValue,
	isDOMNode,
	type LexicalCommand,
	type LexicalEditor,
	type LexicalNode,
	mergeRegister,
	type NodeKey,
	nodeSchema,
	numberValue,
	registerEventListeners,
	stringValue,
	unionValue,
	withAccessors,
	withField,
} from "lexical";
import { Pencil } from "lucide-react";
import {
	type ComponentType,
	type JSX,
	lazy,
	Suspense,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";

import { Button } from "@/editors/lexical/ui/button";
import { cn } from "@/lib/utils";

type Dimension = number | "inherit";

export type ExcalidrawInitialElements = ExcalidrawInitialDataState["elements"];

export const INSERT_EXCALIDRAW_COMMAND: LexicalCommand<void> = createCommand(
	"INSERT_EXCALIDRAW_COMMAND",
);

type ExcalidrawModule = typeof import("@excalidraw/excalidraw");

let excalidrawModule: Promise<ExcalidrawModule> | null = null;

/** Loads Excalidraw and its stylesheet once, on first use. */
function loadExcalidraw(): Promise<ExcalidrawModule> {
	excalidrawModule ??= Promise.all([
		import("@excalidraw/excalidraw"),
		import("@excalidraw/excalidraw/index.css"),
	]).then(([module]) => module);
	return excalidrawModule;
}

const dimensionSchema = unionValue(
	[numberValue(), enumValue(["inherit"])],
	"inherit",
);

const excalidrawNodeSchema = nodeSchema<ExcalidrawNode>()({
	data: withField(stringValue("[]"), { field: "__data", setter: "setData" }),
	height: withAccessors(dimensionSchema, { getter: "getSerializedHeight" }),
	width: withAccessors(dimensionSchema, { getter: "getSerializedWidth" }),
});

export class ExcalidrawNode extends DecoratorNode<JSX.Element> {
	__data: string;
	__width: Dimension;
	__height: Dimension;

	$config() {
		return this.config("excalidraw", {
			extends: DecoratorNode,
			json: excalidrawNodeSchema,
		});
	}

	afterCloneFrom(prevNode: this): void {
		super.afterCloneFrom(prevNode);
		this.__data = prevNode.__data;
		this.__width = prevNode.__width;
		this.__height = prevNode.__height;
	}

	constructor(
		data = "[]",
		width: Dimension = "inherit",
		height: Dimension = "inherit",
		key?: NodeKey,
	) {
		super(key);
		this.__data = data;
		this.__width = width;
		this.__height = height;
	}

	createDOM(config: EditorConfig): HTMLElement {
		const span = $getDocument().createElement("span");
		const className = config.theme.image;
		if (className !== undefined) {
			span.className = className;
		}
		return span;
	}

	updateDOM(): false {
		return false;
	}

	exportDOM(editor: LexicalEditor): DOMExportOutput {
		const element = $getDocument().createElement("span");
		element.style.display = "inline-block";
		const content = editor.getElementByKey(this.getKey());
		const svg = content?.querySelector("svg");
		if (svg) {
			element.innerHTML = svg.outerHTML;
		}
		element.style.width =
			this.__width === "inherit" ? "inherit" : `${this.__width}px`;
		element.style.height =
			this.__height === "inherit" ? "inherit" : `${this.__height}px`;
		element.setAttribute("data-lexical-excalidraw-json", this.__data);
		return { element };
	}

	/** @internal The 'inherit' sentinel is omitted from the JSON. */
	getSerializedWidth(): number | undefined {
		const width = this.getWidth();
		return width === "inherit" ? undefined : width;
	}

	/** @internal */
	getSerializedHeight(): number | undefined {
		const height = this.getHeight();
		return height === "inherit" ? undefined : height;
	}

	setData(data: string): this {
		const self = this.getWritable();
		self.__data = data;
		return self;
	}

	getWidth(): Dimension {
		return this.getLatest().__width;
	}

	setWidth(width: Dimension): this {
		const self = this.getWritable();
		self.__width = width;
		return self;
	}

	getHeight(): Dimension {
		return this.getLatest().__height;
	}

	setHeight(height: Dimension): this {
		const self = this.getWritable();
		self.__height = height;
		return self;
	}

	decorate(): JSX.Element {
		return (
			<ExcalidrawComponent
				nodeKey={this.getKey()}
				data={this.__data}
				width={this.__width}
				height={this.__height}
			/>
		);
	}
}

export function $createExcalidrawNode(
	data = "[]",
	width: Dimension = "inherit",
	height: Dimension = "inherit",
): ExcalidrawNode {
	return new ExcalidrawNode(data, width, height);
}

export function $isExcalidrawNode(
	node: LexicalNode | null | undefined,
): node is ExcalidrawNode {
	return node instanceof ExcalidrawNode;
}

type SceneData = {
	elements?: NonNullable<ExcalidrawInitialElements>;
	files?: BinaryFiles;
	appState?: Partial<AppState>;
};

function parseScene(data: string): Required<SceneData> {
	try {
		const parsed = JSON.parse(data) as SceneData | unknown[];
		if (Array.isArray(parsed)) {
			return { elements: [], files: {}, appState: {} };
		}
		return {
			elements: parsed.elements ?? [],
			files: parsed.files ?? {},
			appState: parsed.appState ?? {},
		};
	} catch {
		return { elements: [], files: {}, appState: {} };
	}
}

/** Renders the scene as an SVG via Excalidraw's exportToSvg. */
function ExcalidrawImage({
	scene,
	width,
	height,
	containerRef,
}: {
	scene: Required<SceneData>;
	width: Dimension;
	height: Dimension;
	containerRef: React.RefObject<HTMLDivElement | null>;
}) {
	const [svgHtml, setSvgHtml] = useState("");

	useEffect(() => {
		let cancelled = false;
		loadExcalidraw()
			.then(({ exportToSvg }) =>
				exportToSvg({
					appState: scene.appState,
					elements: scene.elements as Parameters<
						typeof exportToSvg
					>[0]["elements"],
					files: scene.files,
				}),
			)
			.then((svg) => {
				if (cancelled) {
					return;
				}
				const viewBox = svg.getAttribute("viewBox");
				if (viewBox != null) {
					const [, , w, h] = viewBox.split(" ");
					svg.setAttribute("width", w ?? "");
					svg.setAttribute("height", h ?? "");
				}
				const styleTag = svg.firstElementChild?.firstElementChild;
				if (styleTag && styleTag.tagName === "style") {
					styleTag.remove();
				}
				svg.setAttribute("display", "block");
				if (width === "inherit" && height === "inherit") {
					svg.style.maxWidth = "100%";
					svg.style.height = "auto";
				} else {
					svg.setAttribute("width", "100%");
					svg.setAttribute("height", "100%");
				}
				setSvgHtml(svg.outerHTML);
			})
			.catch(console.error);
		return () => {
			cancelled = true;
		};
	}, [scene, width, height]);

	return (
		<div
			ref={containerRef}
			style={{
				width: width === "inherit" ? undefined : width,
				height: height === "inherit" ? undefined : height,
			}}
			// biome-ignore lint/security/noDangerouslySetInnerHtml: SVG generated by Excalidraw
			dangerouslySetInnerHTML={{ __html: svgHtml }}
		/>
	);
}

const LazyExcalidraw = lazy(async () => {
	const module = await loadExcalidraw();
	return {
		default: module.Excalidraw as unknown as ComponentType<
			Record<string, unknown>
		>,
	};
});

export function ExcalidrawModal({
	initialElements,
	initialAppState,
	initialFiles,
	onSave,
	onDelete,
	onClose,
}: {
	initialElements: ExcalidrawInitialElements;
	initialAppState: Partial<AppState>;
	initialFiles: BinaryFiles;
	onClose: () => void;
	onDelete: () => void;
	onSave: (
		elements: ExcalidrawInitialElements,
		appState: Partial<AppState>,
		files: BinaryFiles,
	) => void;
}) {
	const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);
	const [elements, setElements] =
		useState<ExcalidrawInitialElements>(initialElements);
	const [files, setFiles] = useState<BinaryFiles>(initialFiles);
	const [confirmDiscard, setConfirmDiscard] = useState(false);
	// @lexical/a11y FocusTrapExtension: Tab stays inside the modal; Excalidraw's
	// own popovers/portals are allowed.
	const trapRef = useLexicalFocusTrapRef(true, "container", (target) =>
		target.closest(".excalidraw, .excalidraw-modal-container") !== null,
	);

	const save = () => {
		if (elements?.some((element) => !element.isDeleted)) {
			const appState = api?.getAppState();
			onSave(
				elements,
				{
					exportBackground: appState?.exportBackground,
					exportScale: appState?.exportScale,
					exportWithDarkMode: appState?.theme === "dark",
					isBindingEnabled: appState?.isBindingEnabled,
					name: appState?.name,
					theme: appState?.theme,
					viewBackgroundColor: appState?.viewBackgroundColor,
					viewModeEnabled: appState?.viewModeEnabled,
					zenModeEnabled: appState?.zenModeEnabled,
				},
				files,
			);
		} else {
			onDelete();
		}
	};

	return createPortal(
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
			role="dialog"
			aria-label="Excalidraw"
			data-testid="excalidraw-modal"
		>
			<div
				ref={trapRef}
				tabIndex={-1}
				className="relative flex h-[80vh] w-[min(1100px,95vw)] flex-col overflow-hidden rounded-lg border bg-background shadow-xl outline-none"
			>
				<div className="min-h-0 flex-1">
					<Suspense
						fallback={
							<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
								Loading Excalidraw…
							</div>
						}
					>
						<LazyExcalidraw
							excalidrawAPI={setApi}
							initialData={{
								appState: { ...initialAppState, isLoading: false },
								elements: initialElements,
								files: initialFiles,
							}}
							onChange={(
								nextElements: ExcalidrawInitialElements,
								_state: AppState,
								nextFiles: BinaryFiles,
							) => {
								setElements(nextElements);
								setFiles(nextFiles);
							}}
						/>
					</Suspense>
				</div>
				<div className="flex items-center justify-end gap-2 border-t bg-muted/40 px-3 py-2">
					{confirmDiscard ? (
						<>
							<span className="me-auto text-sm">
								Discard the changes to this drawing?
							</span>
							<Button variant="outline" onClick={() => setConfirmDiscard(false)}>
								Keep editing
							</Button>
							<Button variant="destructive" onClick={onClose}>
								Discard
							</Button>
						</>
					) : (
						<>
							<Button variant="outline" onClick={() => setConfirmDiscard(true)}>
								Discard
							</Button>
							<Button onClick={save} data-testid="excalidraw-save">
								Save
							</Button>
						</>
					)}
				</div>
			</div>
		</div>,
		document.body,
	);
}

function ExcalidrawComponent({
	nodeKey,
	data,
	width,
	height,
}: {
	data: string;
	nodeKey: NodeKey;
	width: Dimension;
	height: Dimension;
}) {
	const [editor] = useLexicalComposerContext();
	const isEditable = useLexicalEditable();
	const [isModalOpen, setModalOpen] = useState(
		data === "[]" && editor.isEditable(),
	);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const buttonRef = useRef<HTMLButtonElement | null>(null);
	const [isSelected, setSelected, clearSelection] =
		useLexicalNodeSelection(nodeKey);
	const [isResizing, setIsResizing] = useState(false);
	const scene = useMemo(() => parseScene(data), [data]);

	useEffect(() => {
		if (!isEditable) {
			if (isSelected) {
				clearSelection();
			}
			return;
		}
		return mergeRegister(
			editor.registerCommand(
				CLICK_COMMAND,
				(event: MouseEvent) => {
					const button = buttonRef.current;
					if (isResizing) {
						return true;
					}
					if (
						button !== null &&
						isDOMNode(event.target) &&
						button.contains(event.target)
					) {
						if (!event.shiftKey) {
							clearSelection();
						}
						setSelected(!isSelected);
						if (event.detail > 1) {
							setModalOpen(true);
						}
						return true;
					}
					return false;
				},
				COMMAND_PRIORITY_LOW,
			),
		);
	}, [clearSelection, editor, isSelected, isResizing, setSelected, isEditable]);

	const removeNode = useCallback(() => {
		setModalOpen(false);
		editor.update(() => {
			$getNodeByKey(nodeKey)?.remove();
		});
	}, [editor, nodeKey]);

	const closeModal = useCallback(() => {
		setModalOpen(false);
		if (scene.elements.length === 0) {
			removeNode();
		}
	}, [removeNode, scene.elements.length]);

	const onResizePointerDown = (event: React.PointerEvent<HTMLSpanElement>) => {
		const container = containerRef.current;
		if (container === null) {
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		const startX = event.clientX;
		const startY = event.clientY;
		const rect = container.getBoundingClientRect();
		setIsResizing(true);
		const cleanup = registerEventListeners(document, {
			pointermove: (move: PointerEvent) => {
				container.style.width = `${Math.max(80, rect.width + move.clientX - startX)}px`;
				container.style.height = `${Math.max(60, rect.height + move.clientY - startY)}px`;
			},
			pointerup: () => {
				cleanup();
				const next = container.getBoundingClientRect();
				setTimeout(() => setIsResizing(false), 200);
				editor.update(() => {
					const node = $getNodeByKey(nodeKey);
					if ($isExcalidrawNode(node)) {
						node.setWidth(Math.round(next.width));
						node.setHeight(Math.round(next.height));
					}
				});
			},
		});
	};

	return (
		<>
			{isEditable && isModalOpen && (
				<ExcalidrawModal
					initialElements={scene.elements}
					initialFiles={scene.files}
					initialAppState={scene.appState}
					onDelete={removeNode}
					onClose={closeModal}
					onSave={(elements, appState, files) => {
						editor.update(() => {
							const node = $getNodeByKey(nodeKey);
							if ($isExcalidrawNode(node)) {
								node.setData(JSON.stringify({ appState, elements, files }));
							}
						});
						setModalOpen(false);
					}}
				/>
			)}
			{scene.elements.length > 0 && (
				<button
					type="button"
					ref={buttonRef}
					data-testid="excalidraw-image"
					className={cn(
						"relative inline-block max-w-full cursor-default rounded-md border-0 bg-transparent p-0",
						isSelected && isEditable && "outline-2 outline-offset-2 outline-primary",
					)}
				>
					<ExcalidrawImage
						scene={scene}
						width={width}
						height={height}
						containerRef={containerRef}
					/>
					{isSelected && isEditable && (
						<>
							<span
								role="button"
								tabIndex={0}
								className="absolute end-2 top-2 inline-flex items-center gap-1 rounded-md bg-background/90 px-2 py-1 text-xs shadow-sm ring-1 ring-border"
								onMouseDown={(event) => event.preventDefault()}
								onClick={() => setModalOpen(true)}
								onKeyDown={(event) => {
									if (event.key === "Enter") {
										setModalOpen(true);
									}
								}}
							>
								<Pencil className="size-3" /> Edit
							</span>
							<span
								role="presentation"
								onPointerDown={onResizePointerDown}
								className="absolute -end-1.5 -bottom-1.5 size-3.5 cursor-nwse-resize rounded-full border-2 border-background bg-primary"
							/>
						</>
					)}
				</button>
			)}
		</>
	);
}

const ExcalidrawImportRule = defineImportRule({
	$import: (_ctx, element) => {
		const data = element.getAttribute("data-lexical-excalidraw-json") ?? "[]";
		const parse = (value: string): Dimension =>
			!value || value === "inherit" ? "inherit" : Number.parseInt(value, 10);
		return [
			$createExcalidrawNode(
				data,
				parse(element.style.width),
				parse(element.style.height),
			),
		];
	},
	match: sel.tag("span").attr("data-lexical-excalidraw-json", true),
	name: "@poc/lexical/excalidraw",
});

export const ExcalidrawExtension = defineExtension({
	dependencies: [
		configExtension(DOMImportExtension, { rules: [ExcalidrawImportRule] }),
	],
	name: "@poc/lexical/playground/Excalidraw",
	nodes: () => [ExcalidrawNode],
});

/** Opens an empty drawing modal on INSERT_EXCALIDRAW_COMMAND and inserts the node on save. */
export function ExcalidrawPlugin(): JSX.Element | null {
	const [editor] = useLexicalComposerContext();
	const [isModalOpen, setModalOpen] = useState(false);

	useEffect(
		() =>
			editor.registerCommand(
				INSERT_EXCALIDRAW_COMMAND,
				() => {
					setModalOpen(true);
					return true;
				},
				COMMAND_PRIORITY_EDITOR,
			),
		[editor],
	);

	if (!isModalOpen) {
		return null;
	}

	return (
		<ExcalidrawModal
			initialElements={[]}
			initialAppState={{}}
			initialFiles={{}}
			onDelete={() => setModalOpen(false)}
			onClose={() => setModalOpen(false)}
			onSave={(elements, appState, files) => {
				editor.update(() => {
					const node = $createExcalidrawNode(
						JSON.stringify({ appState, elements, files }),
					);
					$insertNodes([node]);
					if ($isRootOrShadowRoot(node.getParentOrThrow())) {
						$wrapNodeInElement(node, $createParagraphNode).selectEnd();
					}
				});
				setModalOpen(false);
			}}
		/>
	);
}
