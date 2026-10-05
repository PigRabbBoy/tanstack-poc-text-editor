import { Image } from "lucide-react";
import { useMemo } from "react";

import { useImageFilePicker } from "@/editors/lexical/components/editor/plugins/block-insert/insert-image-plugin";
import {
	type ComponentPickerItem,
	useComponentPickerItems,
} from "@/editors/lexical/components/editor/plugins/component-picker/component-picker-plugin";
import { useTranslation } from "@/editors/lexical/components/editor/plugins/i18n-plugin";

export function ImagePickerPlugin() {
	const { t } = useTranslation();
	const { pick, input } = useImageFilePicker();

	const items = useMemo<ComponentPickerItem[]>(
		() => [
			{
				value: "image",
				label: t.insertImage,
				icon: <Image className="text-muted-foreground" />,
				keywords: ["image", "photo", "picture", "file", "img"],
				onSelect: pick,
			},
		],
		[t, pick],
	);

	useComponentPickerItems(items);

	return input;
}
