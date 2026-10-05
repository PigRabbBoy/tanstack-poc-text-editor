import { BaseCalloutPlugin } from "@platejs/callout";

import { CalloutElementStatic } from "@/editors/plate/ui/callout-node-static";

export const BaseCalloutKit = [
	BaseCalloutPlugin.withComponent(CalloutElementStatic),
];
