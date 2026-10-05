import { FindReplacePlugin } from "@platejs/find-replace";
import { ChevronDownIcon, ReplaceAllIcon, SearchIcon } from "lucide-react";
import { PathApi } from "platejs";
import {
	useEditorPlugin,
	useEditorSelector,
	usePluginOption,
} from "platejs/react";
import { useState } from "react";
import { toast } from "sonner";
import { findRanges, replaceAll } from "@/editors/plate/find-replace";
import { Button } from "@/editors/plate/ui/button";
import { Input } from "@/editors/plate/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/editors/plate/ui/popover";
import { ToolbarButton } from "@/editors/plate/ui/toolbar";

/** Find (@platejs/find-replace highlight) + our replace / next-match actions. */
export function FindReplaceToolbarButton() {
	const { editor, setOption } = useEditorPlugin(FindReplacePlugin);
	const search = usePluginOption(FindReplacePlugin, "search") ?? "";
	const [open, setOpen] = useState(false);
	const [replacement, setReplacement] = useState("");
	const [index, setIndex] = useState(0);
	const count = useEditorSelector(
		(editor) => findRanges(editor, search).length,
		[search],
	);

	function setSearch(value: string) {
		setOption("search", value);
		setIndex(0);
		editor.api.redecorate();
	}

	function next() {
		const ranges = findRanges(editor, search);
		if (ranges.length === 0) return;
		const range = ranges[index % ranges.length];
		setIndex((index + 1) % ranges.length);
		editor.tf.navigation.navigate({
			flash: { variant: "found" },
			focus: false,
			scroll: true,
			select: range,
			target: {
				path:
					editor.api.block({ at: range.anchor.path })?.[1] ??
					PathApi.parent(range.anchor.path),
				type: "node",
			},
		});
	}

	function replaceEverything() {
		const replaced = replaceAll(editor, search, replacement);
		editor.api.redecorate();
		toast.success(`Replaced ${replaced} match${replaced === 1 ? "" : "es"}`);
	}

	return (
		<Popover
			open={open}
			onOpenChange={(value) => {
				setOpen(value);
				if (!value) setSearch("");
			}}
			modal={false}
		>
			<PopoverTrigger asChild>
				<ToolbarButton pressed={open} tooltip="Find & replace">
					<SearchIcon />
				</ToolbarButton>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				className="w-80 space-y-2"
				data-testid="plate-find-replace"
				onOpenAutoFocus={(event) => event.preventDefault()}
			>
				<div className="flex items-center gap-2">
					<Input
						aria-label="Find"
						placeholder="Find…"
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === "Enter") next();
						}}
						autoFocus
					/>
					<span
						className="shrink-0 font-label text-xs text-muted-foreground"
						data-testid="plate-find-count"
					>
						{search ? `${count} found` : ""}
					</span>
				</div>
				<Input
					aria-label="Replace with"
					placeholder="Replace with…"
					value={replacement}
					onChange={(event) => setReplacement(event.target.value)}
				/>
				<div className="flex justify-end gap-2">
					<Button
						size="sm"
						variant="outline"
						onClick={next}
						disabled={count === 0}
					>
						<ChevronDownIcon /> Next
					</Button>
					<Button size="sm" onClick={replaceEverything} disabled={count === 0}>
						<ReplaceAllIcon /> Replace all
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
