import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Lock, LockOpen } from "lucide-react";
import { useEffect, useState } from "react";

import { useTranslation } from "@/editors/lexical/components/editor/plugins/i18n-plugin";
import { Button } from "@/editors/lexical/ui/button";

export function ReadOnlyTogglePlugin() {
	const [editor] = useLexicalComposerContext();
	const { t } = useTranslation();
	const [isEditable, setIsEditable] = useState(() => editor.isEditable());

	useEffect(() => {
		return editor.registerEditableListener(setIsEditable);
	}, [editor]);

	const label = isEditable ? t.switchToReadOnly : t.switchToEditMode;

	return (
		<Button
			variant="ghost"
			size="icon-xs"
			className="text-muted-foreground"
			title={label}
			aria-label={label}
			aria-pressed={!isEditable}
			onClick={() => editor.setEditable(!editor.isEditable())}
		>
			{isEditable ? <LockOpen /> : <Lock />}
		</Button>
	);
}
