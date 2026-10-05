/**
 * Ported from the Lexical playground (MIT, (c) Meta Platforms, Inc.):
 * plugins/TableActionMenuPlugin @ v0.52.0.
 *
 * POC changes: the cell chevron opens the registry's base-ui DropdownMenu
 * instead of the playground DropDown; background colour is a swatch submenu
 * plus a native colour input instead of the playground ColorPicker modal.
 */
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import {
	$computeTableCellRectBoundary,
	$computeTableMap,
	$deleteTableColumnAtSelection,
	$deleteTableRowAtSelection,
	$getNodeTriplet,
	$getTableCellNodeFromLexicalNode,
	$getTableNodeFromLexicalNodeOrThrow,
	$getTableRowIndexFromTableCellNode,
	$insertTableColumnAtSelection,
	$insertTableRowAtSelection,
	$isTableCellNode,
	$isTableSelection,
	$mergeCells,
	$setTableColumnIsHeader,
	$setTableRowIsHeader,
	$unmergeCell,
	getTableElement,
	getTableObserverFromTableElement,
	TableCellHeaderStates,
	type TableCellNode,
	type TableSelection,
} from "@lexical/table";
import {
	$getSelection,
	$isElementNode,
	$isRangeSelection,
	$isTextNode,
	$setSelection,
	COMMAND_PRIORITY_CRITICAL,
	type ElementNode,
	mergeRegister,
	registerEventListener,
	SELECTION_CHANGE_COMMAND,
} from "lexical";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/editors/lexical/ui/dropdown-menu";

const CELL_COLORS: { label: string; value: string }[] = [
	{ label: "None", value: "" },
	{ label: "Lavender", value: "#f1effa" },
	{ label: "Pink", value: "#fde7f1" },
	{ label: "Yellow", value: "#fef9c3" },
	{ label: "Green", value: "#dcfce7" },
	{ label: "Blue", value: "#dbeafe" },
	{ label: "Gray", value: "#f3f4f6" },
];

function $computeSelectionCounts(selection: TableSelection): {
	columns: number;
	rows: number;
} {
	const anchorCell = selection.anchor.getNode();
	const focusCell = selection.focus.getNode();
	if (!$isTableCellNode(anchorCell) || !$isTableCellNode(focusCell)) {
		return { columns: 1, rows: 1 };
	}
	const tableNode = $getTableNodeFromLexicalNodeOrThrow(anchorCell);
	const [map, cellAMap, cellBMap] = $computeTableMap(
		tableNode,
		anchorCell,
		focusCell,
	);
	const { minColumn, maxColumn, minRow, maxRow } =
		$computeTableCellRectBoundary(map, cellAMap, cellBMap);
	return { columns: maxColumn - minColumn + 1, rows: maxRow - minRow + 1 };
}

function $canUnmerge(): boolean {
	const selection = $getSelection();
	if (
		($isRangeSelection(selection) && !selection.isCollapsed()) ||
		($isTableSelection(selection) && !selection.anchor.is(selection.focus)) ||
		(!$isRangeSelection(selection) && !$isTableSelection(selection))
	) {
		return false;
	}
	const [cell] = $getNodeTriplet(selection.anchor);
	return cell.__colSpan > 1 || cell.__rowSpan > 1;
}

function $selectLastDescendant(node: ElementNode): void {
	const lastDescendant = node.getLastDescendant();
	if ($isTextNode(lastDescendant)) {
		lastDescendant.select();
	} else if ($isElementNode(lastDescendant)) {
		lastDescendant.selectEnd();
	} else if (lastDescendant !== null) {
		lastDescendant.selectNext();
	}
}

type MenuState = {
	cell: TableCellNode;
	rect: DOMRect;
	counts: { columns: number; rows: number };
	canMerge: boolean;
	canUnmerge: boolean;
	hasRowHeader: boolean;
	hasColumnHeader: boolean;
	backgroundColor: string | null;
};

export function TableActionMenuPlugin({ cellMerge }: { cellMerge: boolean }) {
	const [editor] = useLexicalComposerContext();
	const isEditable = useLexicalEditable();
	const [state, setState] = useState<MenuState | null>(null);
	const [open, setOpen] = useState(false);

	const $refresh = useCallback(() => {
		const selection = $getSelection();
		let cell: TableCellNode | null = null;
		if ($isRangeSelection(selection)) {
			cell = $getTableCellNodeFromLexicalNode(selection.anchor.getNode());
		} else if ($isTableSelection(selection)) {
			cell = $getTableCellNodeFromLexicalNode(selection.anchor.getNode());
		}
		if (cell === null || !cell.isAttached()) {
			if (!open) {
				setState(null);
			}
			return;
		}
		const element = editor.getElementByKey(cell.getKey());
		if (element === null) {
			setState(null);
			return;
		}
		const tableNode = $getTableNodeFromLexicalNodeOrThrow(cell);
		const tableElement = getTableElement(
			tableNode,
			editor.getElementByKey(tableNode.getKey()),
		);
		const observer =
			tableElement === null
				? null
				: getTableObserverFromTableElement(tableElement);
		if (observer?.isSelecting) {
			return;
		}
		const counts = $isTableSelection(selection)
			? $computeSelectionCounts(selection)
			: { columns: 1, rows: 1 };
		setState({
			cell,
			rect: element.getBoundingClientRect(),
			counts,
			canMerge:
				$isTableSelection(selection) &&
				!selection.anchor.is(selection.focus) &&
				(counts.columns > 1 || counts.rows > 1),
			canUnmerge: $canUnmerge(),
			hasRowHeader: cell.hasHeaderState(TableCellHeaderStates.ROW),
			hasColumnHeader: cell.hasHeaderState(TableCellHeaderStates.COLUMN),
			backgroundColor: cell.getBackgroundColor(),
		});
	}, [editor, open]);

	useEffect(() => {
		let timeoutId: ReturnType<typeof setTimeout> | undefined;
		const schedule = () => {
			if (timeoutId === undefined) {
				timeoutId = setTimeout(() => {
					timeoutId = undefined;
					editor.read($refresh);
				}, 0);
			}
			return false;
		};
		return mergeRegister(
			editor.registerUpdateListener(schedule),
			editor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				schedule,
				COMMAND_PRIORITY_CRITICAL,
			),
			registerEventListener(window, "scroll", schedule, { capture: true }),
			() => clearTimeout(timeoutId),
		);
	}, [editor, $refresh]);

	if (!isEditable || state === null) {
		return null;
	}

	const { cell, rect, counts } = state;

	const run = (fn: () => void, keepSelection = false) => {
		editor.update(() => {
			fn();
			if (!keepSelection) {
				$setSelection(null);
			}
		});
		setOpen(false);
	};

	const $table = () => $getTableNodeFromLexicalNodeOrThrow(cell.getLatest());

	const setBackground = (value: string) =>
		run(() => {
			const selection = $getSelection();
			if ($isRangeSelection(selection) || $isTableSelection(selection)) {
				const [anchorCell] = $getNodeTriplet(selection.anchor);
				anchorCell.setBackgroundColor(value || null);
				if ($isTableSelection(selection)) {
					for (const node of selection.getNodes()) {
						if ($isTableCellNode(node)) {
							node.setBackgroundColor(value || null);
						}
					}
				}
			}
		}, true);

	const setVerticalAlign = (value: string) =>
		run(() => {
			const selection = $getSelection();
			if ($isRangeSelection(selection) || $isTableSelection(selection)) {
				const [anchorCell] = $getNodeTriplet(selection.anchor);
				anchorCell.setVerticalAlign(value);
				if ($isTableSelection(selection)) {
					for (const node of selection.getNodes()) {
						if ($isTableCellNode(node)) {
							node.setVerticalAlign(value);
						}
					}
				}
			}
		}, true);

	const rowLabel = counts.rows === 1 ? "row" : `${counts.rows} rows`;
	const columnLabel =
		counts.columns === 1 ? "column" : `${counts.columns} columns`;
	const { hasRowHeader, hasColumnHeader } = state;

	return createPortal(
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger
				render={
					<button
						type="button"
						aria-label="Table cell actions"
						data-testid="table-cell-action-button"
						className="fixed z-30 flex size-5 items-center justify-center rounded-sm border bg-background text-muted-foreground shadow-sm hover:bg-muted"
						style={{ top: rect.top + 4, left: rect.right - 24 }}
						onMouseDown={(event) => event.preventDefault()}
					/>
				}
			>
				<ChevronDown className="size-3.5" />
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-60"
				align="start"
				data-testid="table-action-menu"
			>
				{cellMerge && state.canMerge && (
					<DropdownMenuItem
						onClick={() =>
							run(() => {
								const selection = $getSelection();
								if (!$isTableSelection(selection)) {
									return;
								}
								const target = $mergeCells(
									selection.getNodes().filter($isTableCellNode),
								);
								if (target) {
									$selectLastDescendant(target);
								}
							}, true)
						}
					>
						Merge cells
					</DropdownMenuItem>
				)}
				{cellMerge && !state.canMerge && state.canUnmerge && (
					<DropdownMenuItem onClick={() => run(() => $unmergeCell())}>
						Unmerge cells
					</DropdownMenuItem>
				)}
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>Background color</DropdownMenuSubTrigger>
					<DropdownMenuSubContent className="w-44">
						{CELL_COLORS.map((color) => (
							<DropdownMenuItem
								key={color.label}
								onClick={() => setBackground(color.value)}
							>
								<span
									className="size-4 rounded-sm border"
									style={{ backgroundColor: color.value || undefined }}
								/>
								{color.label}
							</DropdownMenuItem>
						))}
						<label className="flex items-center gap-2 px-1.5 py-1 text-sm">
							<input
								type="color"
								aria-label="Custom cell color"
								className="size-5 cursor-pointer border-0 bg-transparent p-0"
								defaultValue={state.backgroundColor ?? "#ffffff"}
								onChange={(event) => setBackground(event.target.value)}
							/>
							Custom…
						</label>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>Vertical align</DropdownMenuSubTrigger>
					<DropdownMenuSubContent className="w-36">
						{["top", "middle", "bottom"].map((value) => (
							<DropdownMenuItem
								key={value}
								onClick={() => setVerticalAlign(value)}
							>
								{value[0]?.toUpperCase()}
								{value.slice(1)}
							</DropdownMenuItem>
						))}
					</DropdownMenuSubContent>
				</DropdownMenuSub>
				<DropdownMenuItem
					onClick={() =>
						run(() => {
							const table = $table();
							table.setRowStriping(!table.getRowStriping());
						})
					}
				>
					Toggle row striping
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() =>
						run(() => {
							const table = $table();
							table.setFrozenRows(table.getFrozenRows() === 0 ? 1 : 0);
						})
					}
				>
					Toggle first row freeze
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() =>
						run(() => {
							const table = $table();
							table.setFrozenColumns(table.getFrozenColumns() === 0 ? 1 : 0);
						})
					}
				>
					Toggle first column freeze
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={() =>
						run(() => {
							for (let i = 0; i < counts.rows; i++) {
								$insertTableRowAtSelection(false);
							}
						}, true)
					}
				>
					Insert {rowLabel} above
				</DropdownMenuItem>
				<DropdownMenuItem
					data-testid="table-insert-row-below"
					onClick={() =>
						run(() => {
							for (let i = 0; i < counts.rows; i++) {
								$insertTableRowAtSelection(true);
							}
						}, true)
					}
				>
					Insert {rowLabel} below
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() =>
						run(() => {
							for (let i = 0; i < counts.columns; i++) {
								$insertTableColumnAtSelection(false);
							}
						}, true)
					}
				>
					Insert {columnLabel} left
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() =>
						run(() => {
							for (let i = 0; i < counts.columns; i++) {
								$insertTableColumnAtSelection(true);
							}
						}, true)
					}
				>
					Insert {columnLabel} right
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={() => run(() => $deleteTableColumnAtSelection(), true)}
				>
					Delete column
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => run(() => $deleteTableRowAtSelection(), true)}
				>
					Delete row
				</DropdownMenuItem>
				<DropdownMenuItem
					variant="destructive"
					onClick={() => run(() => $table().remove())}
				>
					Delete table
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={() =>
						run(() => {
							const latest = cell.getLatest();
							$setTableRowIsHeader(
								$table(),
								$getTableRowIndexFromTableCellNode(latest),
								!latest.hasHeaderState(TableCellHeaderStates.ROW),
							);
						})
					}
				>
					{hasRowHeader ? "Remove" : "Add"} row header
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() =>
						run(() => {
							const latest = cell.getLatest();
							const table = $table();
							const [, cellMap] = $computeTableMap(table, latest, latest);
							$setTableColumnIsHeader(
								table,
								cellMap.startColumn,
								!latest.hasHeaderState(TableCellHeaderStates.COLUMN),
							);
						})
					}
				>
					{hasColumnHeader ? "Remove" : "Add"} column header
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>,
		document.body,
	);
}
