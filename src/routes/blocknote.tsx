import { createFileRoute } from "@tanstack/react-router";
import { EditorPage } from "@/components/editor-page";
import { editorModule } from "@/editors/blocknote";

export const Route = createFileRoute("/blocknote")({
	head: () => ({ meta: [{ title: "BlockNote · Text Editor POC" }] }),
	component: () => <EditorPage module={editorModule} />,
});
