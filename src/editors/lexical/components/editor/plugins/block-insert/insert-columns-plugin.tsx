import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { $getRoot, $getSelection, type LexicalEditor } from "lexical";

import { Columns2 } from "lucide-react";

import { INSERT_LAYOUT_COMMAND } from "@/editors/lexical/components/editor/extensions/layout";
import type { Locale } from "@/editors/lexical/components/editor/locales";
import { useTranslation } from "@/editors/lexical/components/editor/plugins/i18n-plugin";
import { Button } from "@/editors/lexical/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/editors/lexical/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/editors/lexical/ui/tooltip";

type ColumnOption = {
	value: string;
	labelKey: keyof Locale;
	templateColumns: string;
};

const COLUMN_OPTIONS: ColumnOption[] = [
	{ value: "one", labelKey: "columnsOne", templateColumns: "1fr" },
	{ value: "two", labelKey: "columnsTwo", templateColumns: "1fr 1fr" },
	{ value: "three", labelKey: "columnsThree", templateColumns: "1fr 1fr 1fr" },
];

function insertColumns(editor: LexicalEditor, value: string) {
	const option = COLUMN_OPTIONS.find((candidate) => candidate.value === value);
	if (!option) {
		return;
	}
	editor.update(() => {
		if (!$getSelection()) {
			$getRoot().selectEnd();
		}
	});
	editor.dispatchCommand(INSERT_LAYOUT_COMMAND, option.templateColumns);
}

export function InsertColumnsPlugin() {
	const [editor] = useLexicalComposerContext();
	const isEditable = useLexicalEditable();
	const { t, dir } = useTranslation();

	return (
		<DropdownMenu>
			<Tooltip>
				<TooltipTrigger
					render={
						<DropdownMenuTrigger
							render={
								<Button
									variant="outline"
									size="icon-sm"
									aria-label={t.columns}
									disabled={!isEditable}
								>
									<Columns2 />
								</Button>
							}
						/>
					}
				/>
				<TooltipContent>{t.columns}</TooltipContent>
			</Tooltip>
			<DropdownMenuContent dir={dir}>
				{COLUMN_OPTIONS.map(({ value, labelKey }) => (
					<DropdownMenuItem
						key={value}
						onClick={() => insertColumns(editor, value)}
					>
						{t[labelKey]}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
