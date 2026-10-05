import type { ComponentType } from "react";
import type { FeatureId } from "@/data/features";

export type EditorId = "plate" | "blocknote" | "lexical" | "tiptap";

/** What every editor reports back on change; the preview panel shows all three. */
export type Snapshot = {
	json: unknown;
	html: string;
	markdown: string;
};

export type EditorProps = {
	/** Markdown to load when there is no stored document (sample, import, round-trip). */
	initialMarkdown: string;
	/** The editor's own JSON from a previous session, or null. Takes precedence over markdown. */
	storedJson: unknown | null;
	/** Call once after the initial content is loaded, then on every change. The page debounces. */
	onChange: (snapshot: Snapshot) => void;
};

export type RenderedProps = {
	/** A `Snapshot.json` produced by the same editor. */
	json: unknown;
};

export type FeatureStatus =
	| "builtin"
	| "kit"
	| "custom"
	| "partial"
	| "paid"
	| "unsupported";

export type FeatureSupport = {
	status: FeatureStatus;
	note?: string;
};

/**
 * One official tool of an editor: a plugin, extension, kit, block, menu or feature listed in its docs.
 * `included` means it is wired into this page and can be tried there.
 */
export type ToolEntry = {
	name: string;
	/** npm package or registry item that provides it. */
	source?: string;
	status: "included" | "excluded";
	/** Required when excluded: why it is not on the page (AI, collaboration, paid, broken…). */
	reason?: string;
	/** How to find or trigger it on the page, e.g. "Slash menu → Callout". */
	howTo?: string;
};

export type EditorMeta = {
	id: EditorId;
	name: string;
	tagline: string;
	homepage: string;
	/** npm packages this page actually depends on. */
	packages: string[];
	/** How the UI on this page was built (official kit, community registry, hand-built). */
	uiApproach: string;
	features: Record<FeatureId, FeatureSupport>;
	/** Things only this editor shows off on its page (Q10c showcase). */
	showcase: string[];
	/** Surprises found while building the POC. */
	findings: string[];
	/** Every official tool/feature from the editor's docs, and whether this page includes it. */
	inventory: ToolEntry[];
};

export type EditorModule = {
	meta: EditorMeta;
	Editor: ComponentType<EditorProps>;
	Rendered: ComponentType<RenderedProps>;
};
