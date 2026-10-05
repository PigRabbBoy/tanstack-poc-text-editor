import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	LexicalTypeaheadMenuPlugin,
	MenuOption,
	type MenuTextMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { $getSelection, $isRangeSelection, type TextNode } from "lexical";
import { Braces } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { type TemplateVariable, VARIABLES } from "@/data/variables";
import {
	type ComponentPickerItem,
	useComponentPickerItems,
} from "@/editors/lexical/components/editor/plugins/component-picker/component-picker-plugin";
import {
	Command,
	CommandItem,
	CommandList,
} from "@/editors/lexical/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/editors/lexical/ui/popover";
import { variableMarkdown } from "@/lib/conventions";
import { $createVariableNode, INSERT_VARIABLE_COMMAND } from "./variable-node";

/**
 * `useBasicTypeaheadTriggerMatch` only supports a single trigger character,
 * so `{{` needs its own matcher. Matches `{{` plus a partial variable name at
 * the end of the text before the caret (but not `{{{`).
 */
const VARIABLE_TRIGGER = /(^|[^{])(\{\{([a-z0-9_]*))$/;

export function checkForVariableTrigger(text: string): MenuTextMatch | null {
	const match = VARIABLE_TRIGGER.exec(text);
	if (match === null) return null;
	const [, before = "", replaceableString = "", matchingString = ""] = match;
	return {
		leadOffset: match.index + before.length,
		matchingString,
		replaceableString,
	};
}

class VariableOption extends MenuOption {
	variable: TemplateVariable;

	constructor(variable: TemplateVariable) {
		super(variable.name);
		this.variable = variable;
	}
}

function filterVariables(query: string): TemplateVariable[] {
	const needle = query.toLowerCase();
	return VARIABLES.filter(
		(variable) =>
			variable.name.includes(needle) ||
			variable.label.toLowerCase().includes(needle),
	);
}

/** Typing `{{` opens a picker of VARIABLES; choosing one inserts an atomic chip. */
export function VariableTypeaheadPlugin() {
	const [editor] = useLexicalComposerContext();
	const [query, setQuery] = useState<string | null>(null);

	const options = useMemo(
		() =>
			query === null
				? []
				: filterVariables(query).map(
						(variable) => new VariableOption(variable),
					),
		[query],
	);

	const onSelectOption = useCallback(
		(
			option: VariableOption,
			nodeToReplace: TextNode | null,
			closeMenu: () => void,
		) => {
			editor.update(() => {
				const variable = $createVariableNode(option.variable.name);
				if (nodeToReplace) {
					nodeToReplace.replace(variable);
				} else {
					const selection = $getSelection();
					if ($isRangeSelection(selection)) selection.insertNodes([variable]);
				}
				variable.selectNext();
				closeMenu();
			});
		},
		[editor],
	);

	return (
		<LexicalTypeaheadMenuPlugin<VariableOption>
			onQueryChange={setQuery}
			onSelectOption={onSelectOption}
			triggerFn={checkForVariableTrigger}
			options={options}
			menuRenderFn={(
				anchorElementRef,
				{ selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
			) =>
				anchorElementRef.current && options.length > 0 ? (
					<Popover open>
						<PopoverPrimitive.Portal container={anchorElementRef.current}>
							<PopoverTrigger
								nativeButton={false}
								render={
									<span
										aria-hidden
										className="pointer-events-none absolute inset-x-0 top-0 h-0"
									/>
								}
							/>
							<PopoverContent
								side="bottom"
								align="start"
								sideOffset={6}
								initialFocus={false}
								finalFocus={false}
								className="w-auto overflow-hidden p-0"
								data-testid="variable-menu"
							>
								<Command
									value={
										selectedIndex === null
											? ""
											: (options[selectedIndex]?.key ?? "")
									}
									onValueChange={(next) => {
										const index = options.findIndex(
											(option) => option.key === next,
										);
										if (index >= 0) setHighlightedIndex(index);
									}}
									shouldFilter={false}
								>
									<CommandList className="max-h-64 w-80">
										{options.map((option) => (
											<CommandItem
												key={option.key}
												ref={option.setRefElement}
												value={option.key}
												onSelect={() => selectOptionAndCleanUp(option)}
											>
												<Braces className="size-4 text-primary-text" />
												<span className="truncate font-label text-xs font-semibold text-primary-text">
													{variableMarkdown(option.variable.name)}
												</span>
												<span className="ms-auto truncate text-xs text-muted-foreground">
													{option.variable.label}
												</span>
											</CommandItem>
										))}
									</CommandList>
								</Command>
							</PopoverContent>
						</PopoverPrimitive.Portal>
					</Popover>
				) : null
			}
		/>
	);
}

/**
 * Slash-menu entries: "Variable" types `{{` (which opens the picker above),
 * and one entry per variable inserts that chip directly.
 */
export function VariablePickerPlugin() {
	const [editor] = useLexicalComposerContext();

	const items = useMemo<ComponentPickerItem[]>(
		() => [
			{
				value: "variable",
				label: "Variable",
				icon: <Braces className="text-primary-text" />,
				keywords: ["variable", "template", "placeholder", "{{"],
				onSelect: () =>
					editor.update(() => {
						const selection = $getSelection();
						if ($isRangeSelection(selection)) selection.insertText("{{");
					}),
			},
			...VARIABLES.map((variable) => ({
				value: `variable:${variable.name}`,
				label: `Variable · ${variable.label}`,
				icon: <Braces className="text-primary-text" />,
				keywords: ["variable", variable.name],
				onSelect: () =>
					editor.dispatchCommand(INSERT_VARIABLE_COMMAND, variable.name),
			})),
		],
		[editor],
	);

	useComponentPickerItems(items);

	return null;
}
