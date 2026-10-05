import { createFileRoute } from "@tanstack/react-router";
import { EditorPage } from "@/components/editor-page";
import { editorModule } from "@/editors/tiptap";

export const Route = createFileRoute("/tiptap")({
	head: () => ({ meta: [{ title: "Tiptap · Text Editor POC" }] }),
	component: () => <EditorPage module={editorModule} />,
});
