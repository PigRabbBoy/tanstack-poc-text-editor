import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $setBlocksType } from "@lexical/selection";
import { $createParagraphNode, $getRoot, $getSelection } from "lexical";
import { Pilcrow } from "lucide-react";
import { useMemo } from "react";

import {
	type ComponentPickerItem,
	useComponentPickerItems,
} from "@/editors/lexical/components/editor/plugins/component-picker/component-picker-plugin";
import { useTranslation } from "@/editors/lexical/components/editor/plugins/i18n-plugin";

export function ParagraphPickerPlugin() {
	const [editor] = useLexicalComposerContext();
	const { t } = useTranslation();

	const items = useMemo<ComponentPickerItem[]>(
		() => [
			{
				value: "paragraph",
				label: t.paragraph,
				icon: <Pilcrow className="text-muted-foreground" />,
				keywords: ["normal", "paragraph", "p", "text"],
				onSelect: () =>
					editor.update(() => {
						const selection = $getSelection() ?? $getRoot().selectEnd();
						$setBlocksType(selection, () => $createParagraphNode());
					}),
			},
		],
		[editor, t],
	);

	useComponentPickerItems(items);

	return null;
}
