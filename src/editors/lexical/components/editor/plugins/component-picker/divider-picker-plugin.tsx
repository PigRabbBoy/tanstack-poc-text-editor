import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/extension";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $getSelection } from "lexical";
import { Minus } from "lucide-react";
import { useMemo } from "react";

import {
	type ComponentPickerItem,
	useComponentPickerItems,
} from "@/editors/lexical/components/editor/plugins/component-picker/component-picker-plugin";
import { useTranslation } from "@/editors/lexical/components/editor/plugins/i18n-plugin";

export function DividerPickerPlugin() {
	const [editor] = useLexicalComposerContext();
	const { t } = useTranslation();

	const items = useMemo<ComponentPickerItem[]>(
		() => [
			{
				value: "divider",
				label: t.insertHorizontalRule,
				icon: <Minus className="text-muted-foreground" />,
				keywords: ["horizontal rule", "divider", "hr", "separator"],
				onSelect: () => {
					editor.update(() => {
						if (!$getSelection()) {
							$getRoot().selectEnd();
						}
					});
					editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
				},
			},
		],
		[editor, t],
	);

	useComponentPickerItems(items);

	return null;
}
