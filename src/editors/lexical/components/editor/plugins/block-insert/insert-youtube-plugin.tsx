import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { $getRoot, $getSelection } from "lexical";
import { SquarePlay } from "lucide-react";
import { useState } from "react";

import { INSERT_YOUTUBE_COMMAND } from "@/editors/lexical/components/editor/extensions/youtube";
import { useTranslation } from "@/editors/lexical/components/editor/plugins/i18n-plugin";
import { Button } from "@/editors/lexical/ui/button";
import { Input } from "@/editors/lexical/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/editors/lexical/ui/popover";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/editors/lexical/ui/tooltip";

export function parseYouTubeVideoID(url: string): string | null {
	const trimmed = url.trim();
	if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) {
		return trimmed;
	}
	const match =
		/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|live\/|watch\?v=|&v=)([^#&?]*).*/.exec(
			trimmed,
		);
	const id = match?.[2];
	return id && id.length === 11 ? id : null;
}

export function InsertYouTubePlugin() {
	const [editor] = useLexicalComposerContext();
	const isEditable = useLexicalEditable();
	const { t, dir } = useTranslation();
	const [open, setOpen] = useState(false);
	const [url, setUrl] = useState("");
	const videoID = parseYouTubeVideoID(url);

	const onOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen);
		if (!nextOpen) {
			setUrl("");
		}
	};

	const onSubmit = () => {
		if (!videoID) {
			return;
		}
		editor.update(() => {
			if (!$getSelection()) {
				$getRoot().selectEnd();
			}
		});
		editor.dispatchCommand(INSERT_YOUTUBE_COMMAND, videoID);
		onOpenChange(false);
	};

	return (
		<Popover open={open} onOpenChange={onOpenChange}>
			<Tooltip>
				<TooltipTrigger
					render={
						<PopoverTrigger
							render={
								<Button
									variant="outline"
									size="icon-sm"
									aria-label={t.insertYoutube}
									disabled={!isEditable}
								>
									<SquarePlay />
								</Button>
							}
						/>
					}
				/>
				<TooltipContent>{t.insertYoutube}</TooltipContent>
			</Tooltip>
			<PopoverContent dir={dir} align="start" className="w-72">
				<div className="flex flex-col gap-2">
					<Input
						dir="ltr"
						placeholder={t.youtubeUrlPlaceholder}
						value={url}
						onChange={(event) => setUrl(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								event.preventDefault();
								onSubmit();
							}
						}}
					/>
					<Button size="sm" disabled={!videoID} onClick={onSubmit}>
						{t.embedYoutube}
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
