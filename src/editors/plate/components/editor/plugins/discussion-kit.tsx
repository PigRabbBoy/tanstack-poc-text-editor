"use client";

import { createPlatePlugin } from "platejs/react";
import { USERS } from "@/data/users";
import { BlockDiscussion } from "@/editors/plate/ui/block-discussion";
import type { TComment } from "@/editors/plate/ui/comment";

export type TDiscussion = {
	id: string;
	comments: TComment[];
	createdAt: Date;
	isResolved: boolean;
	userId: string;
	documentContent?: string;
};

const BLOCK_SUGGESTION_SELECTOR = '[data-block-suggestion="true"]';

const getTargetElement = (target: EventTarget | null) => {
	if (target instanceof HTMLElement) return target;
	if (target instanceof Node) return target.parentElement;

	return null;
};

export const getDiscussionClickTarget = ({
	selector,
	target,
}: {
	selector: string;
	target: EventTarget | null;
}) => {
	const element = getTargetElement(target);

	if (!element) return null;

	return element.closest(selector) as HTMLElement | null;
};

export const getDiscussionBlockClickTarget = ({
	selector = BLOCK_SUGGESTION_SELECTOR,
	target,
}: {
	selector?: string;
	target: EventTarget | null;
}) =>
	getDiscussionClickTarget({
		selector,
		target,
	});

// POC: no backend and no collaboration — discussions live in plugin options
// (in memory) and the "users" are the shared mention list.
const discussionsData: TDiscussion[] = [];

const avatarUrl = (name: string) =>
	`data:image/svg+xml;utf8,${encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#f3eefb"/><text x="16" y="21" font-family="sans-serif" font-size="14" text-anchor="middle" fill="#c2185b">${name.slice(0, 1)}</text></svg>`,
	)}`;

const usersData: Record<
	string,
	{ id: string; avatarUrl: string; name: string; hue?: number }
> = Object.fromEntries(
	USERS.map((user) => [
		user.id,
		{ id: user.id, avatarUrl: avatarUrl(user.name), name: user.name },
	]),
);

// This plugin is purely UI. It's only used to store the discussions and users data
export const discussionPlugin = createPlatePlugin({
	key: "discussion",
	options: {
		currentUserId: "u3",
		discussions: discussionsData,
		users: usersData,
	},
})
	.configure({
		render: { aboveNodes: BlockDiscussion },
	})
	.extendSelectors(({ getOption }) => ({
		currentUser: () => getOption("users")[getOption("currentUserId")],
		user: (id: string) => getOption("users")[id],
	}));

export const DiscussionKit = [discussionPlugin];
