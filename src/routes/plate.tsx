import { createFileRoute } from "@tanstack/react-router";
import { EditorPage } from "@/components/editor-page";
import { editorModule } from "@/editors/plate";

export const Route = createFileRoute("/plate")({
	head: () => ({ meta: [{ title: "Plate · Text Editor POC" }] }),
	component: () => <EditorPage module={editorModule} />,
});
