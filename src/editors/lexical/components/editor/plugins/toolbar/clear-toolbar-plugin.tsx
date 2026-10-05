import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { $getRoot, $isParagraphNode, CLEAR_EDITOR_COMMAND } from "lexical";
import { RemoveFormatting, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { clearFormatting } from "@/editors/lexical/components/editor/extensions/format-state";
import { useTranslation } from "@/editors/lexical/components/editor/plugins/i18n-plugin";
import { Button } from "@/editors/lexical/ui/button";
import { ButtonGroup } from "@/editors/lexical/ui/button-group";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/editors/lexical/ui/tooltip";

function $isEditorEmpty() {
	const children = $getRoot().getChildren();
	if (children.length > 1) {
		return false;
	}
	const firstChild = children[0];
	if (firstChild === undefined) {
		return true;
	}
	return $isParagraphNode(firstChild) && firstChild.isEmpty();
}

export function ClearToolbarPlugin() {
	const [editor] = useLexicalComposerContext();
	const { t } = useTranslation();
	const isEditable = useLexicalEditable();
	const [isEditorEmpty, setIsEditorEmpty] = useState(true);

	useEffect(() => {
		setIsEditorEmpty(editor.read($isEditorEmpty));
		return editor.registerUpdateListener(() => {
			setIsEditorEmpty(editor.read($isEditorEmpty));
		});
	}, [editor]);

	return (
		<ButtonGroup>
			<Tooltip>
				<TooltipTrigger
					render={
						<Button
							variant="outline"
							size="icon-sm"
							aria-label={t.clearFormatting}
							disabled={!isEditable}
							onClick={() => {
								clearFormatting(editor);
							}}
						>
							<RemoveFormatting />
						</Button>
					}
				/>
				<TooltipContent>{t.clearFormatting}</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger
					render={
						<Button
							variant="outline"
							size="icon-sm"
							aria-label={t.clearEditor}
							disabled={!isEditable || isEditorEmpty}
							onClick={() => {
								editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
								editor.focus();
							}}
						>
							<Trash2 />
						</Button>
					}
				/>
				<TooltipContent>{t.clearEditor}</TooltipContent>
			</Tooltip>
		</ButtonGroup>
	);
}
