import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import {
	Details,
	DetailsContent,
	DetailsSummary,
} from "@tiptap/extension-details";
import Emoji, { gitHubEmojis } from "@tiptap/extension-emoji";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Mathematics from "@tiptap/extension-mathematics";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { TableKit } from "@tiptap/extension-table";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import Youtube from "@tiptap/extension-youtube";
import { Markdown } from "@tiptap/markdown";
import type { AnyExtension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import { MentionNode, Variable } from "./nodes";

export const lowlight = createLowlight(common);

/**
 * The document schema + markdown/HTML serializers, shared by the editor,
 * the static renderer and the unit tests. Editor-only behaviour (suggestion
 * popups, node views, file handling…) is layered on in `editor-extensions.ts`.
 */
export type SchemaOverrides = Partial<
	Record<"variable" | "mention" | "emoji" | "mathematics", AnyExtension>
>;

export function schemaExtensions(
	overrides: SchemaOverrides = {},
): AnyExtension[] {
	return [
		StarterKit.configure({
			codeBlock: false,
			link: {
				openOnClick: false,
				autolink: true,
				defaultProtocol: "https",
			},
		}),
		CodeBlockLowlight.configure({ lowlight, defaultLanguage: null }),
		TaskList,
		TaskItem.configure({ nested: true }),
		TableKit.configure({ table: { resizable: true } }),
		Image.configure({ allowBase64: true }),
		TextAlign.configure({ types: ["heading", "paragraph"] }),
		Highlight.configure({ multicolor: true }),
		TextStyle,
		Color,
		Subscript,
		Superscript,
		Typography,
		Details.configure({ persist: true }),
		DetailsSummary,
		DetailsContent,
		overrides.mathematics ??
			Mathematics.configure({ katexOptions: { throwOnError: false } }),
		overrides.emoji ??
			Emoji.configure({ emojis: gitHubEmojis, enableEmoticons: true }),
		Youtube.configure({ nocookie: true, width: 640, height: 360 }),
		overrides.variable ?? Variable,
		overrides.mention ?? MentionNode,
		Markdown.configure({ indentation: { style: "space", size: 2 } }),
	];
}
