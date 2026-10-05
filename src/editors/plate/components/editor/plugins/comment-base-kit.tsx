import { BaseCommentPlugin } from "@platejs/comment";

import { CommentLeafStatic } from "@/editors/plate/ui/comment-node-static";

export const BaseCommentKit = [
	BaseCommentPlugin.withComponent(CommentLeafStatic),
];
