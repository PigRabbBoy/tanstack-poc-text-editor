import {
	BaseBoldPlugin,
	BaseCodePlugin,
	BaseHighlightPlugin,
	BaseItalicPlugin,
	BaseKbdPlugin,
	BaseStrikethroughPlugin,
	BaseSubscriptPlugin,
	BaseSuperscriptPlugin,
	BaseUnderlinePlugin,
} from "@platejs/basic-nodes";

import { CodeLeafStatic } from "@/editors/plate/ui/code-node-static";
import { HighlightLeafStatic } from "@/editors/plate/ui/highlight-node-static";
import { KbdLeafStatic } from "@/editors/plate/ui/kbd-node-static";

export const BaseBasicMarksKit = [
	BaseBoldPlugin,
	BaseItalicPlugin,
	BaseUnderlinePlugin,
	BaseCodePlugin.withComponent(CodeLeafStatic),
	BaseStrikethroughPlugin,
	BaseSubscriptPlugin,
	BaseSuperscriptPlugin,
	BaseHighlightPlugin.withComponent(HighlightLeafStatic),
	BaseKbdPlugin.withComponent(KbdLeafStatic),
];
