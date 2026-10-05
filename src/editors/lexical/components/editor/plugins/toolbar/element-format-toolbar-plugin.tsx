import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { type ElementFormatType, FORMAT_ELEMENT_COMMAND } from "lexical";

import {
	AlignCenter,
	AlignJustify,
	AlignLeft,
	AlignRight,
	type LucideIcon,
	PilcrowLeft,
	PilcrowRight,
} from "lucide-react";

import { useFormatStateValue } from "@/editors/lexical/components/editor/extensions/format-state";
import type { Locale } from "@/editors/lexical/components/editor/locales";
import { useTranslation } from "@/editors/lexical/components/editor/plugins/i18n-plugin";
import {
	ToggleGroup,
	ToggleGroupItem,
} from "@/editors/lexical/ui/toggle-group";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/editors/lexical/ui/tooltip";

type AlignItem = {
	value: Exclude<ElementFormatType, "">;
	labelKey: keyof Locale;
	icon: LucideIcon;
};

function AlignToggleGroup({ items }: { items: AlignItem[] }) {
	const [editor] = useLexicalComposerContext();
	const { t } = useTranslation();
	const elementFormat = useFormatStateValue("elementFormat");
	const isEditable = useLexicalEditable();
	return (
		<ToggleGroup
			variant="outline"
			size="sm"
			spacing={0}
			disabled={!isEditable}
			value={[elementFormat]}
			onValueChange={(value) => {
				const next = value[0] as Exclude<ElementFormatType, ""> | undefined;
				if (next) {
					editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, next);
				}
			}}
		>
			{items.map(({ value, labelKey, icon: Icon }) => (
				<Tooltip key={value}>
					<TooltipTrigger
						render={
							<ToggleGroupItem value={value} aria-label={t[labelKey]}>
								<Icon />
							</ToggleGroupItem>
						}
					/>
					<TooltipContent>{t[labelKey]}</TooltipContent>
				</Tooltip>
			))}
		</ToggleGroup>
	);
}

export function ElementFormatToolbarPlugin({
	formats = "all",
}: {
	formats?: "basic" | "all";
}) {
	const { dir } = useTranslation();
	const isRtl = dir === "rtl";

	const alignGroups: AlignItem[][] = [
		[
			{ value: "left", icon: AlignLeft, labelKey: "alignLeft" },
			{ value: "center", icon: AlignCenter, labelKey: "alignCenter" },
			{ value: "right", icon: AlignRight, labelKey: "alignRight" },
			{ value: "justify", icon: AlignJustify, labelKey: "alignJustify" },
		],
		[
			{
				value: "start",
				icon: isRtl ? PilcrowRight : PilcrowLeft,
				labelKey: "alignStart",
			},
			{
				value: "end",
				icon: isRtl ? PilcrowLeft : PilcrowRight,
				labelKey: "alignEnd",
			},
		],
	];

	const groups = formats === "basic" ? alignGroups.slice(0, 1) : alignGroups;

	return (
		<>
			{groups.map((items, groupIndex) => (
				<AlignToggleGroup key={groupIndex} items={items} />
			))}
		</>
	);
}
