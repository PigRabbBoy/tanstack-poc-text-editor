import {
	BaseFootnoteDefinitionPlugin,
	BaseFootnoteReferencePlugin,
} from "@platejs/footnote";

import {
	FootnoteDefinitionElementStatic,
	FootnoteReferenceElementStatic,
} from "@/editors/plate/ui/footnote-node-static";

export const BaseFootnoteKit = [
	BaseFootnoteReferencePlugin.withComponent(FootnoteReferenceElementStatic),
	BaseFootnoteDefinitionPlugin.withComponent(FootnoteDefinitionElementStatic),
];
