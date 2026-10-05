import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	LexicalTypeaheadMenuPlugin,
	MenuOption,
	type MenuTextMatch,
	useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { $createTextNode, type TextNode } from "lexical";
import { User } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { type MentionUser, USERS } from "@/data/users";

import { $createMentionNode } from "@/editors/lexical/components/editor/nodes/mention-node";
import { useLanguage } from "@/editors/lexical/components/editor/plugins/i18n-plugin";
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

const MAX_SUGGESTIONS = 5;

const PUNCTUATION =
	"\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%'\"~=<>_:;";

const TRIGGERS = ["@"].join("");

const VALID_CHARS = "[^" + TRIGGERS + PUNCTUATION + "\\s]";

const VALID_JOINS = "(?:" + "\\.[ |$]|" + " |" + "[" + PUNCTUATION + "]|" + ")";

const LENGTH_LIMIT = 75;

const AtSignMentionsRegex = new RegExp(
	"(^|\\s|\\()(" +
		"[" +
		TRIGGERS +
		"]" +
		"((?:" +
		VALID_CHARS +
		VALID_JOINS +
		"){0," +
		LENGTH_LIMIT +
		"})" +
		")$",
);

const ALIAS_LENGTH_LIMIT = 50;

const AtSignMentionsRegexAliasRegex = new RegExp(
	"(^|\\s|\\()(" +
		"[" +
		TRIGGERS +
		"]" +
		"((?:" +
		VALID_CHARS +
		"){0," +
		ALIAS_LENGTH_LIMIT +
		"})" +
		")$",
);

// POC: suggestions come from the shared USERS list (synchronous, no lookup service).
function useMentionLookupService(mentionString: string | null): MentionUser[] {
	return useMemo(() => {
		if (mentionString === null) {
			return [];
		}
		const query = mentionString.toLowerCase();
		return USERS.filter(
			(user) =>
				user.name.toLowerCase().includes(query) ||
				user.id.toLowerCase() === query ||
				user.role.toLowerCase().includes(query),
		);
	}, [mentionString]);
}

function checkForAtSignMentions(
	text: string,
	minMatchLength: number,
): MenuTextMatch | null {
	let match = AtSignMentionsRegex.exec(text);

	if (match === null) {
		match = AtSignMentionsRegexAliasRegex.exec(text);
	}
	if (match !== null) {
		const maybeLeadingWhitespace = match[1];
		const matchingString = match[3];
		if (matchingString.length >= minMatchLength) {
			return {
				leadOffset: match.index + maybeLeadingWhitespace.length,
				matchingString,
				replaceableString: match[2],
			};
		}
	}
	return null;
}

class MentionTypeaheadOption extends MenuOption {
	name: string;
	user: MentionUser;

	constructor(user: MentionUser) {
		super(user.id);
		this.name = user.name;
		this.user = user;
	}
}

export function MentionPlugin() {
	const [editor] = useLexicalComposerContext();
	const { dir } = useLanguage();
	const [queryString, setQueryString] = useState<string | null>(null);

	const results = useMentionLookupService(queryString);

	const options = useMemo(
		() =>
			results
				.slice(0, MAX_SUGGESTIONS)
				.map((user) => new MentionTypeaheadOption(user)),
		[results],
	);

	const onSelectOption = useCallback(
		(
			option: MentionTypeaheadOption,
			nodeToReplace: TextNode | null,
			closeMenu: () => void,
		) => {
			editor.update(() => {
				const mentionNode = $createMentionNode(option.user.name, option.user.id);
				if (nodeToReplace) {
					nodeToReplace.replace(mentionNode);
				}
				const space = $createTextNode(" ");
				mentionNode.insertAfter(space);
				space.select();
				closeMenu();
			});
		},
		[editor],
	);

	const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
		minLength: 0,
	});

	const checkForMentionMatch = useCallback(
		(text: string) => {
			if (checkForSlashTriggerMatch(text, editor) !== null) {
				return null;
			}
			return checkForAtSignMentions(text, 1);
		},
		[checkForSlashTriggerMatch, editor],
	);

	return (
		<LexicalTypeaheadMenuPlugin<MentionTypeaheadOption>
			onQueryChange={setQueryString}
			onSelectOption={onSelectOption}
			triggerFn={checkForMentionMatch}
			options={options}
			menuRenderFn={(
				anchorElementRef,
				{ selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
			) =>
				anchorElementRef.current && options.length > 0 ? (
					<Popover open>
						<PopoverPrimitive.Portal
							dir={dir}
							container={anchorElementRef.current}
						>
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
								dir={dir}
								side="bottom"
								align="start"
								sideOffset={6}
								initialFocus={false}
								className="w-auto overflow-hidden p-0"
							>
								<Command
									value={
										selectedIndex === null
											? ""
											: (options[selectedIndex]?.key ?? "")
									}
									onValueChange={(nextValue) => {
										const index = options.findIndex(
											(option) => option.key === nextValue,
										);
										if (index >= 0) {
											setHighlightedIndex(index);
										}
									}}
									shouldFilter={false}
								>
									<CommandList className="max-h-64 w-72">
										{options.map((option) => (
											<CommandItem
												key={option.key}
												ref={option.setRefElement}
												value={option.key}
												onSelect={() => selectOptionAndCleanUp(option)}
											>
												<User className="size-4 text-muted-foreground" />
												<span className="truncate">{option.name}</span>
												<span className="ms-auto truncate text-xs text-muted-foreground">
													{option.user.role}
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
