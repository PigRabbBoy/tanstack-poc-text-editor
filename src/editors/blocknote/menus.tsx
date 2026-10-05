import { combineByGroup } from "@blocknote/core";
import {
	insertOrUpdateBlockForSlashMenu,
	SuggestionMenu,
} from "@blocknote/core/extensions";
import {
	getDiagramBlockTypeSelectItems,
	getDiagramSlashMenuItems,
} from "@blocknote/diagram-block";
import {
	getMathBlockTypeSelectItems,
	getMathSlashMenuItems,
} from "@blocknote/math-block";
import {
	type BlockTypeSelectItem,
	blockTypeSelectItems,
	type DefaultReactSuggestionItem,
	getDefaultReactSlashMenuItems,
	getFormattingToolbarItems,
	getPageBreakReactSlashMenuItems,
} from "@blocknote/react";
import { getMultiColumnSlashMenuItems } from "@blocknote/xl-multi-column";
import { AtSign, Braces, CircleAlert } from "lucide-react";
import { USERS } from "@/data/users";
import { VARIABLES } from "@/data/variables";
import { FontSelect } from "./font-style";
import { customLabels, type UiLanguage } from "./i18n";
import type { AppEditor } from "./schema";

/** Opens a suggestion menu as if its trigger had been typed (docs: "Opening Suggestion Menus Programmatically"). */
export function openMenu(editor: AppEditor, trigger: string) {
	editor.getExtension(SuggestionMenu)?.openSuggestionMenu(trigger, {
		deleteTriggerCharacter: true,
		ignoreQueryLength: true,
	});
}

function initials(name: string): string {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.slice(0, 2);
}

/**
 * The slash menu: BlockNote's defaults plus every opt-in package's items, merged into
 * their groups with `combineByGroup` (page break, columns, math, diagram), and our
 * Alert / Variable / Mention items.
 */
export function slashItems(
	editor: AppEditor,
	language: UiLanguage,
): DefaultReactSuggestionItem[] {
	const labels = customLabels(language);
	const ours: DefaultReactSuggestionItem[] = [
		{
			...labels.alert,
			group: labels.group,
			aliases: ["alert", "callout", "warning", "note", "info"],
			icon: <CircleAlert size={18} />,
			onItemClick: () =>
				insertOrUpdateBlockForSlashMenu(editor, { type: "alert" }),
		},
		{
			...labels.variable,
			group: labels.group,
			aliases: ["variable", "var", "template", "{{", "ตัวแปร"],
			icon: <Braces size={18} />,
			onItemClick: () => openMenu(editor, "{{"),
		},
		{
			...labels.mention,
			group: labels.group,
			aliases: ["mention", "person", "user", "@", "กล่าวถึง"],
			icon: <AtSign size={18} />,
			onItemClick: () => openMenu(editor, "@"),
		},
	];
	return [
		...combineByGroup(
			getDefaultReactSlashMenuItems(editor),
			getPageBreakReactSlashMenuItems(editor),
			getMultiColumnSlashMenuItems(editor),
			getMathSlashMenuItems(editor),
			getDiagramSlashMenuItems(editor),
		),
		...ours,
	];
}

/** Block type dropdown in the formatting toolbars: defaults + math, diagram and alert. */
export function typeSelectItems(editor: AppEditor): BlockTypeSelectItem[] {
	return [
		...blockTypeSelectItems(editor.dictionary),
		...getMathBlockTypeSelectItems(editor),
		...getDiagramBlockTypeSelectItems(editor),
		{
			name: customLabels("en").alert.title,
			type: "alert",
			icon: CircleAlert,
		},
	];
}

/** BlockNote's default toolbar items with our Font select after the text-style buttons. */
export function toolbarItems(editor: AppEditor) {
	const items = getFormattingToolbarItems(typeSelectItems(editor));
	const strike = items.findIndex((item) => item.key === "strikeStyleButton");
	items.splice(strike + 1, 0, <FontSelect key="fontSelect" />);
	return items;
}

export function variableItems(editor: AppEditor): DefaultReactSuggestionItem[] {
	return VARIABLES.map((variable) => ({
		title: variable.label,
		subtext: `{{${variable.name}}} · ${variable.sample}`,
		aliases: [variable.name],
		icon: <Braces size={16} />,
		onItemClick: () =>
			editor.insertInlineContent([
				{ type: "variable", props: { name: variable.name } },
				" ",
			]),
	}));
}

export function mentionItems(editor: AppEditor): DefaultReactSuggestionItem[] {
	return USERS.map((user) => ({
		title: user.name,
		subtext: user.role,
		aliases: [user.id],
		icon: (
			<span className="flex size-6 items-center justify-center rounded-full bg-accent font-label text-[10px] font-semibold text-accent-foreground">
				{initials(user.name)}
			</span>
		),
		onItemClick: () =>
			editor.insertInlineContent([
				{ type: "mention", props: { id: user.id, label: user.name } },
				" ",
			]),
	}));
}
