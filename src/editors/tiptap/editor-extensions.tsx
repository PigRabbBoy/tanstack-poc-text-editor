import { Decoration } from "@tiptap/core";
import Emoji, { gitHubEmojis } from "@tiptap/extension-emoji";
import FileHandler from "@tiptap/extension-file-handler";
import FindAndReplace from "@tiptap/extension-find-and-replace";
import InvisibleCharacters from "@tiptap/extension-invisible-characters";
import Mathematics from "@tiptap/extension-mathematics";
import NodeRange from "@tiptap/extension-node-range";
import TableOfContents from "@tiptap/extension-table-of-contents";
import {
	CharacterCount,
	Focus,
	Placeholder,
	Selection,
} from "@tiptap/extensions";
import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
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

declare module "@tiptap/core" {
	interface Storage {
		blockLabels: { visible: boolean };
	}
}

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
					items: ({ query }) => filterItems(SLASH_ITEMS, query, 60),
					command: ({ editor, range, props }) =>
						props.run(editor, range, actions),
					render: renderSuggestionMenu("Blocks"),
				}),
			];
		},
	});
}

/** App-level keyboard shortcuts (addKeyboardShortcuts) that open our React popovers. */
function appShortcuts(actions: EditorActions) {
	return Extension.create({
		name: "appShortcuts",
		addKeyboardShortcuts() {
			return {
				"Mod-k": () => {
					actions.openLink();
					return true;
				},
				"Mod-f": () => {
					actions.openFind();
					return true;
				},
			};
		},
	});
}

/**
 * Decorations API demo: labels every top-level block with its type and the
 * UniqueID `uid`. Toggled at runtime through storage + updateDecorations().
 */
export const BlockLabels = Extension.create({
	name: "blockLabels",
	addStorage() {
		return { visible: false };
	},
	addDecorations() {
		return {
			create: ({ state }) => {
				if (!this.storage.visible) return [];
				const decorations: Decoration[] = [];
				state.doc.forEach((node, pos) => {
					const uid = node.attrs.uid as string | null | undefined;
					if (!uid) return;
					decorations.push(
						Decoration.Node(pos, pos + node.nodeSize, {
							"data-block-label": `${node.type.name} · ${uid}`,
						}),
					);
				});
				return decorations;
			},
		};
	},
});

/**
 * Selection keeps a blurred text selection visible, but on re-focus it restores
 * the old range in a rAF that lands before the click's own selection, so a click
 * into the editor after using a toolbar menu was swallowed. Collapsing the stale
 * selection on mousedown (before focus fires) lets the click win.
 */
const KeepSelectionWhileBlurred = Selection.extend({
	addProseMirrorPlugins() {
		const editor = this.editor;
		const clickFix = new Plugin({
			key: new PluginKey("selectionClickFix"),
			props: {
				handleDOMEvents: {
					mousedown: (view, event) => {
						const { selection, doc } = view.state;
						if (editor.isFocused || selection.empty || event.shiftKey)
							return false;
						if (!(selection instanceof TextSelection)) return false;
						view.dispatch(
							view.state.tr.setSelection(
								TextSelection.create(doc, selection.to),
							),
						);
						return false;
					},
				},
			},
		});
		return [clickFix, ...(this.parent?.() ?? [])];
	},
});

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
		appShortcuts(actions),
		NodeRange,
		CharacterCount,
		Placeholder.configure({
			placeholder: ({ node }) =>
				node.type.name === "heading"
					? `Heading ${node.attrs.level}`
					: "Type / for blocks, @ to mention, {{ for a variable…",
		}),
		Focus.configure({ mode: "shallowest" }),
		KeepSelectionWhileBlurred,
		FindAndReplace.configure({ injectCSS: false }),
		InvisibleCharacters.configure({ visible: false }),
		BlockLabels,
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
