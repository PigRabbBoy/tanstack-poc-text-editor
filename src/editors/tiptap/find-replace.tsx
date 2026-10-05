import { type Editor, useEditorState } from "@tiptap/react";
import {
	CaseSensitive,
	ChevronDown,
	ChevronUp,
	Regex,
	Search,
	WholeWord,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Toggle } from "@/components/ui/toggle";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

/** FindAndReplace extension: search (case / regex / whole word), step through hits, replace one or all. */
export function FindReplace({
	editor,
	open,
	onOpenChange,
}: {
	editor: Editor;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	// setSearchTerm is debounced (storage lags behind typing), so the input keeps its own value.
	const [term, setTerm] = useState("");
	const state = useEditorState({
		editor,
		selector: ({ editor: e }) => {
			const storage = e.storage.findAndReplace;
			return {
				replaceTerm: storage.replaceTerm,
				caseSensitive: storage.caseSensitive,
				useRegex: storage.useRegex,
				wholeWord: storage.wholeWord,
				count: storage.results.length,
				current: storage.currentIndex,
			};
		},
	});

	const commands = editor.commands;
	const position =
		state.count === 0
			? "No results"
			: `${(state.current ?? 0) + 1} of ${state.count}`;

	return (
		<Popover
			open={open}
			onOpenChange={(next) => {
				if (!next) {
					commands.clearSearch();
					setTerm("");
				}
				onOpenChange(next);
			}}
		>
			<Tooltip>
				<TooltipTrigger asChild>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							size="icon-sm"
							aria-label="Find and replace"
							data-testid="tiptap-find-toggle"
							onMouseDown={(event) => event.preventDefault()}
						>
							<Search />
						</Button>
					</PopoverTrigger>
				</TooltipTrigger>
				<TooltipContent side="bottom">Find & replace ⌘F</TooltipContent>
			</Tooltip>
			<PopoverContent
				align="end"
				className="w-96 space-y-2 p-3"
				data-testid="tiptap-find"
			>
				<form
					className="flex items-center gap-1"
					onSubmit={(event) => {
						event.preventDefault();
						commands.goToNextResult();
					}}
				>
					<Input
						autoFocus
						value={term}
						placeholder="Find"
						aria-label="Find"
						onChange={(event) => {
							setTerm(event.target.value);
							commands.setSearchTerm(event.target.value);
						}}
					/>
					<Toggle
						size="sm"
						aria-label="Match case"
						pressed={state.caseSensitive}
						onPressedChange={(value) => commands.setCaseSensitive(value)}
					>
						<CaseSensitive />
					</Toggle>
					<Toggle
						size="sm"
						aria-label="Whole word"
						pressed={state.wholeWord}
						onPressedChange={(value) => commands.setWholeWord(value)}
					>
						<WholeWord />
					</Toggle>
					<Toggle
						size="sm"
						aria-label="Regular expression"
						pressed={state.useRegex}
						onPressedChange={(value) => commands.setUseRegex(value)}
					>
						<Regex />
					</Toggle>
				</form>
				<div className="flex items-center gap-1">
					<Input
						value={state.replaceTerm}
						placeholder="Replace with"
						aria-label="Replace with"
						onChange={(event) => commands.setReplaceTerm(event.target.value)}
					/>
					<Button
						size="sm"
						variant="outline"
						disabled={state.count === 0}
						onClick={() => commands.replace()}
					>
						Replace
					</Button>
					<Button
						size="sm"
						variant="outline"
						disabled={state.count === 0}
						onClick={() => commands.replaceAll()}
					>
						All
					</Button>
				</div>
				<div className="flex items-center justify-between font-label text-xs text-muted-foreground">
					<span data-testid="tiptap-find-count">{position}</span>
					<span className="flex gap-1">
						<Button
							size="icon-xs"
							variant="ghost"
							aria-label="Previous result"
							disabled={state.count === 0}
							onClick={() => commands.goToPreviousResult()}
						>
							<ChevronUp />
						</Button>
						<Button
							size="icon-xs"
							variant="ghost"
							aria-label="Next result"
							disabled={state.count === 0}
							onClick={() => commands.goToNextResult()}
						>
							<ChevronDown />
						</Button>
					</span>
				</div>
			</PopoverContent>
		</Popover>
	);
}
