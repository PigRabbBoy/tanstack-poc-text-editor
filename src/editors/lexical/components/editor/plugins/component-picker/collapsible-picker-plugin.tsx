import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { $getRoot, $getSelection } from "lexical";
import { ListCollapse } from "lucide-react";
import { useMemo } from "react";

import { INSERT_COLLAPSIBLE_COMMAND } from "@/editors/lexical/components/editor/extensions/collapsible";
import {
	type ComponentPickerItem,
	useComponentPickerItems,
} from "@/editors/lexical/components/editor/plugins/component-picker/component-picker-plugin";
import { useTranslation } from "@/editors/lexical/components/editor/plugins/i18n-plugin";

export function CollapsiblePickerPlugin() {
	const [editor] = useLexicalComposerContext();
	const { t } = useTranslation();

	const items = useMemo<ComponentPickerItem[]>(
		() => [
			{
				value: "collapsible",
				label: t.insertCollapsible,
				icon: <ListCollapse className="text-muted-foreground" />,
				keywords: ["collapse", "collapsible", "toggle", "details", "accordion"],
				onSelect: () => {
					editor.update(() => {
						if (!$getSelection()) {
							$getRoot().selectEnd();
						}
					});
					editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined);
				},
			},
		],
		[editor, t],
	);

	useComponentPickerItems(items);

	return null;
}
