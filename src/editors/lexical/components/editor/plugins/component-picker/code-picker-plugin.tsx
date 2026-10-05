import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { CodeXml } from "lucide-react";
import { useMemo } from "react";

import { insertCodeBlock } from "@/editors/lexical/components/editor/extensions/code";
import {
	type ComponentPickerItem,
	useComponentPickerItems,
} from "@/editors/lexical/components/editor/plugins/component-picker/component-picker-plugin";
import { useTranslation } from "@/editors/lexical/components/editor/plugins/i18n-plugin";

export function CodePickerPlugin() {
	const [editor] = useLexicalComposerContext();
	const { t } = useTranslation();

	const items = useMemo<ComponentPickerItem[]>(
		() => [
			{
				value: "code-block",
				label: t.insertCodeBlock,
				icon: <CodeXml className="text-muted-foreground" />,
				keywords: ["code", "codeblock", "javascript", "python", "js"],
				onSelect: () => insertCodeBlock(editor),
			},
		],
		[editor, t],
	);

	useComponentPickerItems(items);

	return null;
}
