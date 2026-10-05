import {
	computeDiff,
	type DiffOperation,
	type DiffUpdate,
	withGetFragmentExcludeDiff,
} from "@platejs/diff";
import { cloneDeep } from "lodash";
import { History, Save } from "lucide-react";
import { createSlatePlugin, type Value } from "platejs";
import {
	createPlateEditor,
	Plate,
	type PlateEditor,
	PlateLeaf,
	type PlateLeafProps,
	toPlatePlugin,
	usePlateEditor,
} from "platejs/react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ContentKit } from "@/editors/plate/editor-kit";
import { Editor, EditorContainer } from "@/editors/plate/ui/editor";
import { cn } from "@/lib/utils";

const DIFF_CLASS: Record<DiffOperation["type"], string> = {
	delete: "bg-destructive/15 line-through decoration-destructive",
	insert: "bg-bml-success/20",
	update: "bg-muted",
};

function describeUpdate({ newProperties, properties }: DiffUpdate) {
	return Object.keys(newProperties)
		.map(
			(key) =>
				`${key}: ${properties[key] ?? "–"} → ${newProperties[key] ?? "–"}`,
		)
		.join("\n");
}

function DiffLeaf(props: PlateLeafProps) {
	const operation = props.leaf.diffOperation as DiffOperation;
	return (
		<PlateLeaf
			{...props}
			className={DIFF_CLASS[operation.type]}
			attributes={{
				...props.attributes,
				"data-diff": operation.type,
				title:
					operation.type === "update" ? describeUpdate(operation) : undefined,
			}}
		/>
	);
}

/** @platejs/diff marks changed text as leaves and changed blocks via aboveNodes. */
const DiffPlugin = toPlatePlugin(
	createSlatePlugin({ key: "diff", node: { isLeaf: true } }).overrideEditor(
		withGetFragmentExcludeDiff,
	),
	{
		render: {
			node: DiffLeaf,
			aboveNodes:
				() =>
				({ children, editor, element }) => {
					if (!element.diff) return children;
					const operation = element.diffOperation as DiffOperation;
					const Tag = editor.api.isInline(element) ? "span" : "div";
					return (
						<Tag
							className={DIFF_CLASS[operation.type]}
							data-diff={operation.type}
						>
							{children}
						</Tag>
					);
				},
		},
	},
);

const VIEWER_PLUGINS = [...ContentKit, DiffPlugin];

function DiffView({ previous, current }: { previous: Value; current: Value }) {
	const diff = useMemo(() => {
		const probe = createPlateEditor({ plugins: VIEWER_PLUGINS });
		return computeDiff(cloneDeep(previous), cloneDeep(current), {
			ignoreProps: ["id"],
			isInline: probe.api.isInline,
			lineBreakChar: "¶",
		}) as Value;
	}, [previous, current]);
	const editor = usePlateEditor({ plugins: VIEWER_PLUGINS, value: diff }, [
		diff,
	]);
	return (
		<Plate editor={editor} readOnly>
			<EditorContainer
				className="max-h-96 rounded-lg border"
				data-testid="plate-version-diff"
			>
				<Editor variant="none" className="px-4 py-3 text-sm leading-[1.8]" />
			</EditorContainer>
		</Plate>
	);
}

/** Version history (registry example) on the main document: save, edit, compare. */
export function VersionHistory({ editor }: { editor: PlateEditor }) {
	const [versions, setVersions] = useState<Value[]>([]);
	const [comparing, setComparing] = useState<{
		index: number;
		current: Value;
	} | null>(null);

	return (
		<div className="space-y-2" data-testid="plate-version-history">
			<div className="flex flex-wrap items-center gap-2">
				<Button
					size="sm"
					variant="outline"
					onClick={() =>
						setVersions((all) => [...all, cloneDeep(editor.children)])
					}
					data-testid="plate-save-version"
				>
					<Save /> Save version
				</Button>
				{versions.map((_, index) => (
					<Button
						// biome-ignore lint/suspicious/noArrayIndexKey: versions are append-only
						key={index}
						size="sm"
						variant={comparing?.index === index ? "secondary" : "ghost"}
						onClick={() =>
							setComparing({ index, current: cloneDeep(editor.children) })
						}
					>
						<History /> Compare v{index + 1} with now
					</Button>
				))}
			</div>
			{comparing && versions[comparing.index] && (
				<div className={cn("space-y-1")}>
					<p className="font-label text-xs text-muted-foreground">
						Green = inserted since v{comparing.index + 1}, red = deleted,
						lavender = formatting changed (hover for details).
					</p>
					<DiffView
						previous={versions[comparing.index]}
						current={comparing.current}
					/>
				</div>
			)}
		</div>
	);
}
