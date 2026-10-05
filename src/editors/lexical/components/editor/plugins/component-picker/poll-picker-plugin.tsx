import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { $getRoot, $getSelection } from "lexical";
import { ListTodo } from "lucide-react";
import { useMemo } from "react";

import { INSERT_POLL_COMMAND } from "@/editors/lexical/components/editor/extensions/poll";
import {
	type ComponentPickerItem,
	useComponentPickerItems,
} from "@/editors/lexical/components/editor/plugins/component-picker/component-picker-plugin";
import { useTranslation } from "@/editors/lexical/components/editor/plugins/i18n-plugin";

export function PollPickerPlugin() {
	const [editor] = useLexicalComposerContext();
	const { t } = useTranslation();

	const items = useMemo<ComponentPickerItem[]>(
		() => [
			{
				value: "poll",
				label: t.insertPoll,
				icon: <ListTodo className="text-muted-foreground" />,
				keywords: ["poll", "vote", "survey", "question"],
				onSelect: () => {
					editor.update(() => {
						if (!$getSelection()) {
							$getRoot().selectEnd();
						}
					});
					editor.dispatchCommand(INSERT_POLL_COMMAND, "");
				},
			},
		],
		[editor, t],
	);

	useComponentPickerItems(items);

	return null;
}
