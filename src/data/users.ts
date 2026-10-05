export type MentionUser = {
	id: string;
	name: string;
	role: string;
};

/** Sample people for @mention menus. Ids appear in markdown as `[@Name](mention:id)`. */
export const USERS: MentionUser[] = [
	{ id: "u1", name: "สมชาย ใจดี", role: "Account Manager" },
	{ id: "u2", name: "Suda Rakthai", role: "Designer" },
	{ id: "u3", name: "Benz Sirimongkon", role: "Engineer" },
	{ id: "u4", name: "มานี มีนา", role: "Customer Success" },
	{ id: "u5", name: "John Carter", role: "Legal" },
];

export function findUser(id: string): MentionUser | undefined {
	return USERS.find((user) => user.id === id);
}
