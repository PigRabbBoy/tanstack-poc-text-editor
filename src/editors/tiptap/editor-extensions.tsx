import CharacterCount from "@tiptap/extension-character-count";
import Emoji, { gitHubEmojis } from "@tiptap/extension-emoji";
import FileHandler from "@tiptap/extension-file-handler";
import Mathematics from "@tiptap/extension-mathematics";
import NodeRange from "@tiptap/extension-node-range";
import Placeholder from "@tiptap/extension-placeholder";
import TableOfContents from "@tiptap/extension-table-of-contents";
import { PluginKey } from "@tiptap/pm/state";
import {
	type AnyExtension,
	Extension,
	ReactNodeViewRenderer,
} from "@tiptap/react";
import { Suggestion } from "@tiptap/suggestion";
import { USERS } from "@/data/users";
import { VARIABLES } from "@/data/variables";
import { type EditorActions, insertImageFiles } from "./editor-actions";
import { schemaExtensions } from "./extensions";
import { MentionNode, Variable } from "./nodes";
import { SLASH_ITEMS, type SlashItem } from "./slash-items";
import {
	filterItems,
	type MenuItem,
	renderSuggestionMenu,
} from "./suggestion-menu";
import { VariableChip } from "./variable-chip";

const PEOPLE: MenuItem[] = USERS.map((user) => ({
	id: user.id,
	title: user.name,
	description: user.role,
	hint: `@${user.id}`,
}));

const VARIABLE_ITEMS: MenuItem[] = VARIABLES.map((variable) => ({
	id: variable.name,
	title: variable.label,
	description: `e.g. ${variable.sample}`,
	hint: `{{${variable.name}}}`,
}));

const EMOJI_ITEMS: MenuItem[] = gitHubEmojis
	.filter((item) => item.emoji)
	.map((item) => ({
		id: item.name,
		title: `:${item.shortcodes[0] ?? item.name}:`,
		icon: <span className="text-base leading-none">{item.emoji}</span>,
		keywords: [...item.shortcodes, ...item.tags],
	}));

/** Second suggestion trigger: `{{` opens the variable picker. */
const VariableSuggestion = Extension.create({
	name: "variableSuggestion",
	addProseMirrorPlugins() {
		return [
			Suggestion<MenuItem, MenuItem>({
				editor: this.editor,
				pluginKey: new PluginKey("variableSuggestion"),
				char: "{{",
				allowedPrefixes: null,
				items: ({ query }) => filterItems(VARIABLE_ITEMS, query),
				command: ({ editor, range, props }) => {
					editor
						.chain()
						.focus()
						.insertContentAt(range, [
							{ type: "variable", attrs: { name: props.id } },
							{ type: "text", text: " " },
						])
						.run();
				},
				render: renderSuggestionMenu("Variables"),
			}),
		];
	},
});

function slashCommand(actions: EditorActions) {
	return Extension.create({
		name: "slashCommand",
		addProseMirrorPlugins() {
			return [
				Suggestion<SlashItem, SlashItem>({
					editor: this.editor,
					pluginKey: new PluginKey("slashCommand"),
					char: "/",
					items: ({ query }) => filterItems(SLASH_ITEMS, query, 50),
					command: ({ editor, range, props }) =>
						props.run(editor, range, actions),
					render: renderSuggestionMenu("Blocks"),
				}),
			];
		},
	});
}

/** Everything the interactive editor needs on top of the shared schema. */
export function editorExtensions(actions: EditorActions): AnyExtension[] {
	return [
		...schemaExtensions({
			variable: Variable.extend({
				addNodeView() {
					return ReactNodeViewRenderer(VariableChip, { as: "span" });
				},
			}),
			mention: MentionNode.configure({
				suggestions: [
					{
						char: "@",
						pluginKey: new PluginKey("mentionSuggestion"),
						items: ({ query }) => filterItems(PEOPLE, query),
						render: renderSuggestionMenu<MenuItem>("People"),
						command: ({ editor, range, props }) => {
							const item = props as MenuItem;
							editor
								.chain()
								.focus()
								.insertContentAt(range, [
									{
										type: "mention",
										attrs: { id: item.id, label: item.title },
									},
									{ type: "text", text: " " },
								])
								.run();
						},
					},
				],
			}),
			emoji: Emoji.configure({
				emojis: gitHubEmojis,
				enableEmoticons: true,
				suggestion: {
					items: ({ query }: { query: string }) =>
						filterItems(EMOJI_ITEMS, query, 8),
					render: renderSuggestionMenu<MenuItem>("Emoji"),
					command: ({ editor, range, props }) => {
						editor
							.chain()
							.focus()
							.deleteRange(range)
							.setEmoji((props as MenuItem).id)
							.run();
					},
				},
			}),
			mathematics: Mathematics.configure({
				katexOptions: { throwOnError: false },
				inlineOptions: {
					onClick: (node, pos) =>
						actions.prompt("inlineMath", node.attrs.latex, pos),
				},
				blockOptions: {
					onClick: (node, pos) =>
						actions.prompt("blockMath", node.attrs.latex, pos),
				},
			}),
		}),
		VariableSuggestion,
		slashCommand(actions),
		NodeRange,
		CharacterCount,
		Placeholder.configure({
			placeholder: ({ node }) =>
				node.type.name === "heading"
					? `Heading ${node.attrs.level}`
					: "Type / for blocks, @ to mention, {{ for a variable…",
		}),
		FileHandler.configure({
			allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
			onDrop: (editor, files, pos) => {
				void insertImageFiles(editor, files, pos);
			},
			onPaste: (editor, files) => {
				void insertImageFiles(editor, files);
			},
		}),
		TableOfContents.configure({
			onUpdate: (items) => actions.onToc(items),
		}),
	];
}
