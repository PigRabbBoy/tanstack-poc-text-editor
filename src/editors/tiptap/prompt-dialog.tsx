import { generateJSON } from "@tiptap/core";
import type { Editor } from "@tiptap/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { PromptKind } from "./editor-actions";

export type PromptState = { kind: PromptKind; value: string; pos?: number };

type PromptSpec = {
	title: string;
	description: string;
	placeholder: string;
	multiline?: boolean;
	/** Returns false when the value was rejected (the dialog stays open). */
	submit: (editor: Editor, value: string, pos?: number) => boolean;
};

function chain(editor: Editor, pos?: number) {
	const base = editor.chain().focus();
	return pos === undefined ? base : base.setNodeSelection(pos);
}

const PROMPTS: Record<PromptKind, PromptSpec> = {
	youtube: {
		title: "Embed a YouTube video",
		description: "Paste a youtube.com or youtu.be link (rendered nocookie).",
		placeholder: "https://www.youtube.com/watch?v=…",
		submit: (editor, value) => {
			const ok = editor.chain().focus().setYoutubeVideo({ src: value }).run();
			if (!ok) toast.error("That does not look like a YouTube URL");
			return ok;
		},
	},
	twitch: {
		title: "Embed a Twitch video, clip or channel",
		description:
			"twitch.tv/videos/…, clips.twitch.tv/… or twitch.tv/<channel>.",
		placeholder: "https://www.twitch.tv/videos/1234567890",
		submit: (editor, value) => {
			const ok = editor.chain().focus().setTwitchVideo({ src: value }).run();
			if (!ok) toast.error("That does not look like a Twitch URL");
			return ok;
		},
	},
	audio: {
		title: "Embed audio by URL",
		description:
			"An http(s) link to an audio file. Use Insert → Audio file to inline a file ≤ 1 MB instead.",
		placeholder: "https://example.com/podcast.mp3",
		submit: (editor, value) => {
			const ok = editor
				.chain()
				.focus()
				.setAudio({ src: value, controls: true })
				.run();
			if (!ok) toast.error("That does not look like an audio URL");
			return ok;
		},
	},
	inlineMath: {
		title: "Inline math",
		description: "LaTeX rendered with KaTeX. Markdown: $…$",
		placeholder: "E = mc^2",
		submit: (editor, value, pos) => {
			if (pos !== undefined)
				editor.chain().focus().updateInlineMath({ latex: value, pos }).run();
			else if (value)
				editor.chain().focus().insertInlineMath({ latex: value }).run();
			return true;
		},
	},
	blockMath: {
		title: "Block math",
		description: "LaTeX rendered with KaTeX. Markdown: $$…$$",
		placeholder: "\\sum_{i=1}^{n} x_i",
		submit: (editor, value, pos) => {
			if (pos !== undefined)
				editor.chain().focus().updateBlockMath({ latex: value, pos }).run();
			else if (value)
				editor.chain().focus().insertBlockMath({ latex: value }).run();
			return true;
		},
	},
	rubyText: {
		title: "Ruby annotation",
		description:
			"Pronunciation shown above the selected text (<ruby>). Leave empty to remove. Click an annotation in the text to edit it in place.",
		placeholder: "かんじ",
		submit: (editor, value) => {
			const next = editor.chain().focus();
			if (value) next.setRubyText({ rt: value }).run();
			else next.unsetRubyText().run();
			return true;
		},
	},
	imageAlt: {
		title: "Image alt text",
		description: "Describes the image for screen readers; markdown ![alt](…).",
		placeholder: "Boonmee Lab logo",
		submit: (editor, value, pos) => {
			chain(editor, pos)
				.updateAttributes("image", { alt: value || null })
				.run();
			return true;
		},
	},
	imageCaption: {
		title: "Image caption",
		description:
			'Shown under the image; stored as the title — markdown ![alt](src "caption"), HTML <figcaption>.',
		placeholder: "Figure 1 — quotation summary",
		submit: (editor, value, pos) => {
			chain(editor, pos)
				.updateAttributes("image", { title: value || null })
				.run();
			return true;
		},
	},
	html: {
		title: "Insert HTML",
		description:
			"Converted with generateJSON() (HTML utility) using this editor's schema, then inserted at the caret.",
		placeholder:
			'<h2>Hello</h2><p>Dear <span data-type="variable" data-name="customer_name">{{customer_name}}</span></p>',
		multiline: true,
		submit: (editor, value) => {
			const json = generateJSON(value, editor.extensionManager.extensions);
			editor.chain().focus().insertContent(json).run();
			return true;
		},
	},
	markdown: {
		title: "Insert markdown",
		description:
			"insertContent(…, { contentType: 'markdown' }) — parsed by @tiptap/markdown at the caret.",
		placeholder: "## Terms\n\n- Pay {{amount}} by {{due_date}}",
		multiline: true,
		submit: (editor, value) => {
			editor
				.chain()
				.focus()
				.insertContent(value, { contentType: "markdown" })
				.run();
			return true;
		},
	},
};

/** One dialog for every "ask for a value, then run a command" tool. */
export function PromptDialog({
	editor,
	prompt,
	onClose,
}: {
	editor: Editor;
	prompt: PromptState | null;
	onClose: () => void;
}) {
	const [value, setValue] = useState("");
	useEffect(() => setValue(prompt?.value ?? ""), [prompt]);
	const spec = prompt ? PROMPTS[prompt.kind] : PROMPTS.youtube;
	const editing = prompt?.pos !== undefined || Boolean(prompt?.value);

	function submit() {
		if (!prompt) return;
		const text = spec.multiline ? value : value.trim();
		if (spec.submit(editor, text, prompt.pos)) onClose();
	}

	return (
		<Dialog open={prompt !== null} onOpenChange={(open) => !open && onClose()}>
			<DialogContent data-testid="tiptap-prompt">
				<DialogHeader>
					<DialogTitle>{spec.title}</DialogTitle>
					<DialogDescription>{spec.description}</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						submit();
					}}
				>
					{spec.multiline ? (
						<textarea
							autoFocus
							value={value}
							placeholder={spec.placeholder}
							onChange={(event) => setValue(event.target.value)}
							className="min-h-40 w-full rounded-md border bg-background p-3 font-mono text-sm"
							aria-label={spec.title}
						/>
					) : (
						<Input
							autoFocus
							value={value}
							placeholder={spec.placeholder}
							onChange={(event) => setValue(event.target.value)}
							className="font-mono"
							aria-label={spec.title}
						/>
					)}
					<DialogFooter className="mt-4">
						<Button type="button" variant="ghost" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit">{editing ? "Update" : "Insert"}</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
