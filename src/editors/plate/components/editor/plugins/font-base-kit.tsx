import {
	BaseFontBackgroundColorPlugin,
	BaseFontColorPlugin,
	BaseFontFamilyPlugin,
	BaseFontSizePlugin,
	BaseFontWeightPlugin,
} from "@platejs/basic-styles";
import type { SlatePluginConfig } from "platejs";
import { KEYS } from "platejs";

const options = {
	inject: { targetPlugins: [KEYS.p] },
} satisfies SlatePluginConfig;

export const BaseFontKit = [
	BaseFontColorPlugin.configure(options),
	BaseFontBackgroundColorPlugin.configure(options),
	BaseFontSizePlugin.configure(options),
	BaseFontFamilyPlugin.configure(options),
	// POC: font weight is documented but missing from the registry kit.
	BaseFontWeightPlugin.configure(options),
];
