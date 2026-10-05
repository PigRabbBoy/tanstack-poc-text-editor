import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/research")({
	head: () => ({ meta: [{ title: "Research · Text Editor POC" }] }),
	component: Research,
});

function Research() {
	return <div className="p-6">Research — coming next.</div>;
}
