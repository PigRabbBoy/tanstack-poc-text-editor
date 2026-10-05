import { syntaxHighlighter } from "@blocknote/code-block";
import {
	BlockNoteSchema,
	createCodeBlockSpec,
	defaultBlockSpecs,
	defaultInlineContentSpecs,
	defaultStyleSpecs,
	withPageBreak,
} from "@blocknote/core";
import { createReactDiagramBlockSpec } from "@blocknote/diagram-block";
import {
	createReactInlineMathSpec,
	createReactMathBlockSpec,
} from "@blocknote/math-block";
import { createReactInlineContentSpec } from "@blocknote/react";
import {
	multiColumnDropCursor,
	withMultiColumn,
} from "@blocknote/xl-multi-column";
import { findUser } from "@/data/users";
import { MENTION_HREF_PREFIX } from "@/lib/conventions";
import { Alert } from "./alert";
import { CodeLanguageGuard, codeLanguages } from "./code-languages";
import { Font } from "./font-style";

const chip =
	"inline-block rounded-sm bg-muted px-1 font-label text-[0.9em] font-medium text-primary-text";

/**
 * `{{name}}` template variable. `content: "none"` makes it an atomic inline node:
 * the caret jumps over it and Backspace deletes it as one unit.
 */
export const Variable = createReactInlineContentSpec(
	{
		type: "variable",
		propSchema: { name: { default: "" } },
		content: "none",
	},
	{
		render: ({ inlineContent }) => (
			<span
				data-type="variable"
				data-name={inlineContent.props.name}
				className={chip}
				contentEditable={false}
			>
				{`{{${inlineContent.props.name}}}`}
			</span>
		),
		// Shared HTML convention (src/lib/conventions.ts): no classes, just data attributes.
		toExternalHTML: ({ inlineContent }) => (
			<span data-type="variable" data-name={inlineContent.props.name}>
				{`{{${inlineContent.props.name}}}`}
			</span>
		),
		parse: (element) =>
			element.dataset.type === "variable" && element.dataset.name
				? { name: element.dataset.name }
				: undefined,
	},
);

/** `@Name` mention of one of `USERS`. Label is stored so unknown ids still render. */
export const Mention = createReactInlineContentSpec(
	{
		type: "mention",
		propSchema: { id: { default: "" }, label: { default: "" } },
		content: "none",
	},
	{
		render: ({ inlineContent }) => {
			const user = findUser(inlineContent.props.id);
			return (
				<span
					data-type="mention"
					data-id={inlineContent.props.id}
					title={user ? `${user.name} · ${user.role}` : inlineContent.props.id}
					className="rounded-sm bg-accent px-1 font-medium text-accent-foreground"
					contentEditable={false}
				>
					@{inlineContent.props.label}
				</span>
			);
		},
		toExternalHTML: ({ inlineContent }) => (
			<span data-type="mention" data-id={inlineContent.props.id}>
				@{inlineContent.props.label}
			</span>
		),
		parse: (element) => {
			if (element.dataset.type !== "mention" || !element.dataset.id)
				return undefined;
			return {
				id: element.dataset.id,
				label: (element.textContent ?? "").replace(/^@/, ""),
			};
		},
	},
);

/**
 * Every official block BlockNote 0.55 ships, plus ours:
 * - the default blocks, with the code block configured for @blocknote/code-block's
 *   Shiki languages (see code-languages.ts for why "" and aliases are guarded);
 * - page break (core, opt-in via `withPageBreak`);
 * - math block + inline math (@blocknote/math-block) and the Mermaid diagram block
 *   (@blocknote/diagram-block);
 * - columns (@blocknote/xl-multi-column, via `withMultiColumn`);
 * - the docs' Alert block and Font style (custom block / style examples) and our
 *   variable / mention chips (custom inline content).
 */
export const schema = withMultiColumn(
	withPageBreak(
		BlockNoteSchema.create({
			blockSpecs: {
				...defaultBlockSpecs,
				codeBlock: createCodeBlockSpec(codeLanguages),
				mathBlock: createReactMathBlockSpec(),
				diagram: createReactDiagramBlockSpec(),
				alert: Alert(),
			},
			inlineContentSpecs: {
				...defaultInlineContentSpecs,
				math: createReactInlineMathSpec(),
				variable: Variable,
				mention: Mention,
			},
			styleSpecs: { ...defaultStyleSpecs, font: Font },
		}),
	),
);

export type AppEditor = typeof schema.BlockNoteEditor;
export type AppBlock = typeof schema.Block;
export type AppPartialBlock = typeof schema.PartialBlock;

// Same allowlist as BlockNote's internal `isAllowedUri` (its JSDoc says to import it from
// `@blocknote/core`, but 0.55 does not export it) plus our `mention:` scheme.
const ALLOWED_URI =
	/^(?:(?:http|https|ftp|ftps|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z0-9+.-]+(?:[^a-z+.\-:]|$))/i;

export function isValidLink(href: string): boolean {
	return (
		!href || ALLOWED_URI.test(href) || href.startsWith(MENTION_HREF_PREFIX)
	);
}

/**
 * Options shared by the editor, the read-only view and headless tests. Without the
 * `isValidLink` override BlockNote silently drops `mention:` links on markdown/HTML import.
 */
export const baseEditorOptions = {
	schema,
	links: { isValidLink },
	// The multi-column drop cursor also shows up beside blocks, to drop into a new column.
	dropCursor: multiColumnDropCursor,
	// Advanced tables: merge/split cells, cell colours and header rows/columns.
	tables: {
		splitCells: true,
		cellBackgroundColor: true,
		cellTextColor: true,
		headers: true,
	},
	extensions: [syntaxHighlighter, CodeLanguageGuard()],
};
