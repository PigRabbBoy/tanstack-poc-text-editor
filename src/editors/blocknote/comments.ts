import { DefaultThreadStoreAuth } from "@blocknote/core/comments";
import { YjsThreadStore } from "@blocknote/core/yjs";
import * as Y from "yjs";
import { findUser, USERS } from "@/data/users";

/** Comments are written as this sample user (the POC has no login). */
export const COMMENT_USER_ID = "u3";

function initials(name: string): string {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.slice(0, 2);
}

/** A BML token's value (an image can't read CSS variables, so the avatar inlines them). */
function token(name: string): string {
	return getComputedStyle(document.documentElement)
		.getPropertyValue(name)
		.trim();
}

/** Inline SVG avatar, so comments need no network. */
function avatar(name: string): string {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="32" fill="${token("--bml-pink-050")}"/><text x="32" y="40" font-family="sans-serif" font-size="24" font-weight="600" text-anchor="middle" fill="${token("--bml-pink-700")}">${initials(name)}</text></svg>`;
	return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export async function resolveUsers(ids: string[]) {
	return ids.flatMap((id) => {
		const user = findUser(id);
		return user
			? [{ id: user.id, username: user.name, avatarUrl: avatar(user.name) }]
			: [];
	});
}

/**
 * BlockNote's server-less comments setup (its own `comments-testing` example): a
 * `YjsThreadStore` over a local Y.Doc that no provider ever syncs. Threads live as long
 * as the page; the comment anchors are a `blocknoteIgnore` mark, so they are not part
 * of `editor.document` and are not saved with it.
 */
export function createThreadStore() {
	const doc = new Y.Doc();
	return new YjsThreadStore(
		COMMENT_USER_ID,
		doc.getMap("threads"),
		new DefaultThreadStoreAuth(COMMENT_USER_ID, "editor"),
	);
}

export const COMMENT_USER =
	USERS.find((user) => user.id === COMMENT_USER_ID) ?? USERS[0];
