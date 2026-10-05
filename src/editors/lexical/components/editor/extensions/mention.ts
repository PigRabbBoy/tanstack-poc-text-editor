import { defineExtension } from "lexical";

import { MentionNode } from "@/editors/lexical/components/editor/nodes/mention-node";

export const MentionExtension = defineExtension({
	name: "@shadcn-editor/editor/Mention",
	nodes: () => [MentionNode],
});
