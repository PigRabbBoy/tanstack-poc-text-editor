import { type Editor, useEditorState } from "@tiptap/react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { keepEditorFocus } from "./controls";

/** View toggles that live in React (CSS classes on the editor frame). */
export type ViewSettings = {
	focusMode: boolean;
	blockLabels: boolean;
	dragLocked: boolean;
};

export const DEFAULT_VIEW: ViewSettings = {
	focusMode: false,
	blockLabels: false,
	dragLocked: false,
};

/** Runtime toggles: editable, invisible characters, focus mode, UniqueID labels, drag-handle lock. */
export function SettingsMenu({
	editor,
	view,
	onViewChange,
}: {
	editor: Editor;
	view: ViewSettings;
	onViewChange: (next: ViewSettings) => void;
}) {
	const state = useEditorState({
		editor,
		selector: ({ editor: e }) => ({
			editable: e.isEditable,
			invisible: e.storage.invisibleCharacters.visibility(),
		}),
	});

	function set<K extends keyof ViewSettings>(key: K, value: ViewSettings[K]) {
		onViewChange({ ...view, [key]: value });
	}

	return (
		<DropdownMenu>
			<Tooltip>
				<TooltipTrigger asChild>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon-sm"
							aria-label="Editor settings"
							data-testid="tiptap-settings"
							onMouseDown={(event) => event.preventDefault()}
						>
							<Settings2 />
						</Button>
					</DropdownMenuTrigger>
				</TooltipTrigger>
				<TooltipContent side="bottom">View & editing settings</TooltipContent>
			</Tooltip>
			<DropdownMenuContent
				onCloseAutoFocus={keepEditorFocus}
				align="end"
				className="w-72"
			>
				<DropdownMenuLabel className="eyebrow">Editing</DropdownMenuLabel>
				<DropdownMenuCheckboxItem
					checked={!state.editable}
					onCheckedChange={(readOnly) => editor.setEditable(!readOnly)}
				>
					Read-only (setEditable)
				</DropdownMenuCheckboxItem>
				<DropdownMenuCheckboxItem
					checked={view.dragLocked}
					onCheckedChange={(locked) => {
						// The React DragHandle has no `locked` prop in 3.31; its plugin reads this meta.
						editor.commands.setMeta("lockDragHandle", locked);
						set("dragLocked", locked);
					}}
				>
					Lock drag handle (setMeta)
				</DropdownMenuCheckboxItem>
				<DropdownMenuSeparator />
				<DropdownMenuLabel className="eyebrow">View</DropdownMenuLabel>
				<DropdownMenuCheckboxItem
					checked={state.invisible}
					data-testid="tiptap-toggle-invisible"
					onCheckedChange={(show) =>
						editor.commands.showInvisibleCharacters(show)
					}
				>
					Invisible characters
				</DropdownMenuCheckboxItem>
				<DropdownMenuCheckboxItem
					checked={view.focusMode}
					data-testid="tiptap-toggle-focus"
					onCheckedChange={(on) => set("focusMode", on)}
				>
					Focus mode (dim other blocks)
				</DropdownMenuCheckboxItem>
				<DropdownMenuCheckboxItem
					checked={view.blockLabels}
					data-testid="tiptap-toggle-ids"
					onCheckedChange={(on) => {
						editor.storage.blockLabels.visible = on;
						editor.commands.updateDecorations("blockLabels");
						set("blockLabels", on);
					}}
				>
					Block IDs (UniqueID + Decorations API)
				</DropdownMenuCheckboxItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
