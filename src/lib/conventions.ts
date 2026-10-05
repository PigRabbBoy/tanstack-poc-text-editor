/**
 * Markdown conventions shared by all four editors so one sample document loads everywhere.
 *
 *   variable  →  {{customer_name}}
 *   mention   →  [@สมชาย ใจดี](mention:u1)
 *
 * HTML exported by every editor must use the same data attributes so the
 * preview can fill variables without knowing which editor produced it:
 *
 *   <span data-type="variable" data-name="customer_name">{{customer_name}}</span>
 *   <span data-type="mention" data-id="u1">@สมชาย ใจดี</span>
 */

export const VARIABLE_NAME = /^[a-z_][a-z0-9_]*$/;

export const VARIABLE_PATTERN = /\{\{([a-z_][a-z0-9_]*)\}\}/g;

export const MENTION_PATTERN = /\[@([^\]]+)\]\(mention:([\w-]+)\)/g;

export const MENTION_HREF_PREFIX = "mention:";

export function variableMarkdown(name: string): string {
	return `{{${name}}}`;
}

export function mentionMarkdown(id: string, label: string): string {
	return `[@${label}](${MENTION_HREF_PREFIX}${id})`;
}

export function variableHtml(name: string): string {
	return `<span data-type="variable" data-name="${escapeHtml(name)}">{{${escapeHtml(name)}}}</span>`;
}

export function mentionHtml(id: string, label: string): string {
	return `<span data-type="mention" data-id="${escapeHtml(id)}">@${escapeHtml(label)}</span>`;
}

export type InlineToken =
	| { type: "text"; text: string }
	| { type: "variable"; name: string }
	| { type: "mention"; id: string; label: string };

/** Splits plain text into text / variable / mention tokens (used by editors without a markdown hook). */
export function tokenizeInline(text: string): InlineToken[] {
	const pattern = new RegExp(
		`${VARIABLE_PATTERN.source}|${MENTION_PATTERN.source}`,
		"g",
	);
	const tokens: InlineToken[] = [];
	let last = 0;
	for (const match of text.matchAll(pattern)) {
		const index = match.index ?? 0;
		if (index > last)
			tokens.push({ type: "text", text: text.slice(last, index) });
		if (match[1] !== undefined)
			tokens.push({ type: "variable", name: match[1] });
		else
			tokens.push({
				type: "mention",
				label: match[2] ?? "",
				id: match[3] ?? "",
			});
		last = index + match[0].length;
	}
	if (last < text.length) tokens.push({ type: "text", text: text.slice(last) });
	return tokens;
}

/** Replaces variable chips (by data attribute) and bare `{{name}}` text with values. */
export function fillVariablesInHtml(
	html: string,
	values: Record<string, string>,
): string {
	const chip = /<span([^>]*?)data-type="variable"([^>]*?)>[\s\S]*?<\/span>/g;
	const filled = html.replace(chip, (whole, before: string, after: string) => {
		const name = /data-name="([^"]+)"/.exec(`${before}${after}`)?.[1];
		if (!name || !(name in values)) return whole;
		return `<mark data-filled="${escapeHtml(name)}">${escapeHtml(values[name] ?? "")}</mark>`;
	});
	return filled.replace(VARIABLE_PATTERN, (whole, name: string) =>
		name in values
			? `<mark data-filled="${name}">${escapeHtml(values[name] ?? "")}</mark>`
			: whole,
	);
}

export function fillVariablesInMarkdown(
	markdown: string,
	values: Record<string, string>,
): string {
	return markdown.replace(
		VARIABLE_PATTERN,
		(whole, name: string) => values[name] ?? whole,
	);
}

export function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
}
