import { BaseMentionPlugin } from "@platejs/mention";

import { MentionElementStatic } from "@/editors/plate/ui/mention-node-static";

export const BaseMentionKit = [
	BaseMentionPlugin.withComponent(MentionElementStatic),
];
