import { BaseTogglePlugin } from "@platejs/toggle";

import { ToggleElementStatic } from "@/editors/plate/ui/toggle-node-static";

export const BaseToggleKit = [
	BaseTogglePlugin.withComponent(ToggleElementStatic),
];
