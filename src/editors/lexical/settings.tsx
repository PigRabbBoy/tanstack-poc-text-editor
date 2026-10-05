import {
	EditorModeAnnounceExtension,
	HistoryAnnounceExtension,
} from "@lexical/a11y";
import { CodePrismExtension } from "@lexical/code-prism";
import { CodeShikiExtension } from "@lexical/code-shiki";
import {
	ClickAfterLastBlockExtension,
	getExtensionDependencyFromEditor,
	SelectBlockExtension,
	SelectionAlwaysOnDisplayExtension,
	TabIndentationExtension,
} from "@lexical/extension";
import {
	AutoLinkAnnounceExtension,
	ClickableLinkExtension,
	LinkExtension,
} from "@lexical/link";
import { CheckListExtension, ListExtension } from "@lexical/list";
import { MdastShortcutsExtension } from "@lexical/mdast";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HeadingAnnounceExtension } from "@lexical/rich-text";
import { TableExtension } from "@lexical/table";
import type { AnyLexicalExtension, LexicalEditor } from "lexical";
import {
	createContext,
	type Dispatch,
	type ReactNode,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { AutocompleteExtension } from "@/editors/lexical/components/editor/extensions/autocomplete";
import { SpecialTextExtension } from "@/editors/lexical/components/editor/extensions/special-text";
import { MaxLengthExtension } from "@/editors/lexical/components/playground/max-length";
import { VisibleNonPrintingExtension } from "@/editors/lexical/components/playground/visible-non-printing";

/** Playground-style switches; each maps to an extension signal or a mounted plugin. */
export type LabSettings = {
	markdownShortcuts: "lexical-markdown" | "mdast" | "off";
	specialText: boolean;
	autocomplete: boolean;
	maxLength: boolean;
	maxLengthValue: number;
	charLimit: "off" | "UTF-16" | "UTF-8";
	charLimitValue: number;
	codeHighlighting: boolean;
	codeHighlighter: "shiki" | "prism";
	tableCellMerge: boolean;
	tableCellBackgroundColor: boolean;
	tableHorizontalScroll: boolean;
	nestedTables: boolean;
	fitNestedTables: boolean;
	tableStickyScrollbar: boolean;
	listStrictIndent: boolean;
	checklistKeepsFocus: boolean;
	linkAttributes: boolean;
	linksInNewTab: boolean;
	selectionAlwaysOnDisplay: boolean;
	selectBlock: boolean;
	clickAfterLastBlock: boolean;
	tabIndentation: boolean;
	announcements: boolean;
	visibleNonPrinting: boolean;
	contextMenu: "registry" | "lexical";
	preserveNewlinesInMarkdown: boolean;
	tableOfContents: boolean;
	commentsPanel: boolean;
	treeView: boolean;
	pasteLog: boolean;
	typingPerf: boolean;
	testRecorder: boolean;
};

export const DEFAULT_SETTINGS: LabSettings = {
	markdownShortcuts: "lexical-markdown",
	specialText: false,
	autocomplete: false,
	maxLength: false,
	maxLengthValue: 1500,
	charLimit: "off",
	charLimitValue: 1000,
	codeHighlighting: true,
	codeHighlighter: "shiki",
	tableCellMerge: true,
	tableCellBackgroundColor: true,
	tableHorizontalScroll: true,
	nestedTables: false,
	fitNestedTables: false,
	tableStickyScrollbar: false,
	listStrictIndent: false,
	checklistKeepsFocus: false,
	linkAttributes: false,
	linksInNewTab: true,
	selectionAlwaysOnDisplay: false,
	selectBlock: true,
	clickAfterLastBlock: true,
	tabIndentation: true,
	announcements: true,
	visibleNonPrinting: false,
	contextMenu: "registry",
	preserveNewlinesInMarkdown: false,
	tableOfContents: false,
	commentsPanel: false,
	treeView: false,
	pasteLog: false,
	typingPerf: false,
	testRecorder: false,
};

const STORAGE_KEY = "tanstack-poc-text-editor:lexical:lab-settings";

function readSettings(): LabSettings {
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (raw === null) return DEFAULT_SETTINGS;
		return {
			...DEFAULT_SETTINGS,
			...(JSON.parse(raw) as Partial<LabSettings>),
		};
	} catch {
		return DEFAULT_SETTINGS;
	}
}

function writeSettings(settings: LabSettings) {
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
	} catch {
		// Private mode or blocked storage: settings just don't persist.
	}
}

type Update = <K extends keyof LabSettings>(
	key: K,
	value: LabSettings[K],
) => void;

const SettingsContext = createContext<{
	settings: LabSettings;
	update: Update;
	reset: Dispatch<void>;
} | null>(null);

export function LabSettingsProvider({ children }: { children: ReactNode }) {
	const [settings, setSettings] = useState(readSettings);

	const value = useMemo(
		() => ({
			settings,
			update: ((key, next) =>
				setSettings((current) => {
					const updated = { ...current, [key]: next };
					writeSettings(updated);
					return updated;
				})) as Update,
			reset: () => {
				writeSettings(DEFAULT_SETTINGS);
				setSettings(DEFAULT_SETTINGS);
			},
		}),
		[settings],
	);

	return (
		<SettingsContext.Provider value={value}>
			{children}
		</SettingsContext.Provider>
	);
}

export function useLabSettings() {
	const context = useContext(SettingsContext);
	if (context === null) {
		throw new Error("useLabSettings must be used inside LabSettingsProvider");
	}
	return context;
}

/** Writes a value into an extension's config signal (no editor rebuild). */
function setSignal<E extends AnyLexicalExtension>(
	editor: LexicalEditor,
	extension: E,
	apply: (
		output: ReturnType<typeof getExtensionDependencyFromEditor<E>>["output"],
	) => void,
) {
	apply(getExtensionDependencyFromEditor(editor, extension).output);
}

const LINK_ATTRIBUTES = { rel: "noopener noreferrer", target: "_blank" };

/**
 * Mirrors the settings onto the extensions' reactive config signals, the way
 * the Lexical playground's useSynchronizeSettings does, so toggles never
 * rebuild the editor or lose history.
 */
export function LabSettingsSync() {
	const [editor] = useLexicalComposerContext();
	const { settings } = useLabSettings();

	useEffect(() => {
		setSignal(editor, SpecialTextExtension, (o) => {
			o.disabled.value = !settings.specialText;
		});
		setSignal(editor, AutocompleteExtension, (o) => {
			o.disabled.value = !settings.autocomplete;
		});
		setSignal(editor, MaxLengthExtension, (o) => {
			o.maxLength.value = settings.maxLengthValue;
			o.disabled.value = !settings.maxLength;
		});
		setSignal(editor, CodeShikiExtension, (o) => {
			o.disabled.value =
				!settings.codeHighlighting || settings.codeHighlighter !== "shiki";
		});
		setSignal(editor, CodePrismExtension, (o) => {
			o.disabled.value =
				!settings.codeHighlighting || settings.codeHighlighter !== "prism";
		});
		setSignal(editor, TableExtension, (o) => {
			o.hasCellMerge.value = settings.tableCellMerge;
			o.hasCellBackgroundColor.value = settings.tableCellBackgroundColor;
			// Like the playground: fitting nested tables turns horizontal scroll off.
			o.hasHorizontalScroll.value =
				settings.tableHorizontalScroll && !settings.fitNestedTables;
			o.hasStickyScrollbar.value = settings.tableStickyScrollbar;
			o.hasNestedTables.value = settings.nestedTables;
		});
		setSignal(editor, ListExtension, (o) => {
			o.hasStrictIndent.value = settings.listStrictIndent;
		});
		setSignal(editor, CheckListExtension, (o) => {
			o.disableTakeFocusOnClick.value = settings.checklistKeepsFocus;
		});
		setSignal(editor, LinkExtension, (o) => {
			o.attributes.value = settings.linkAttributes
				? LINK_ATTRIBUTES
				: undefined;
		});
		setSignal(editor, ClickableLinkExtension, (o) => {
			o.newTab.value = settings.linksInNewTab;
		});
		setSignal(editor, SelectionAlwaysOnDisplayExtension, (o) => {
			o.disabled.value = !settings.selectionAlwaysOnDisplay;
		});
		setSignal(editor, SelectBlockExtension, (o) => {
			o.disabled.value = !settings.selectBlock;
		});
		setSignal(editor, ClickAfterLastBlockExtension, (o) => {
			o.disabled.value = !settings.clickAfterLastBlock;
		});
		setSignal(editor, TabIndentationExtension, (o) => {
			o.disabled.value = !settings.tabIndentation;
		});
		setSignal(editor, VisibleNonPrintingExtension, (o) => {
			o.disabled.value = !settings.visibleNonPrinting;
		});
		setSignal(editor, MdastShortcutsExtension, (o) => {
			o.disabled.value = settings.markdownShortcuts !== "mdast";
		});
		for (const extension of [
			HistoryAnnounceExtension,
			EditorModeAnnounceExtension,
			AutoLinkAnnounceExtension,
			HeadingAnnounceExtension,
		]) {
			setSignal(editor, extension as AnyLexicalExtension, (o) => {
				(o as { disabled: { value: boolean } }).disabled.value =
					!settings.announcements;
			});
		}
	}, [editor, settings]);

	return null;
}
