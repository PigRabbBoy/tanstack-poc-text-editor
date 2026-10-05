import { createFileRoute } from "@tanstack/react-router";
import { EditorPage } from "@/components/editor-page";
import { editorModule } from "@/editors/lexical";

export const Route = createFileRoute("/lexical")({
	head: () => ({ meta: [{ title: "Lexical · Text Editor POC" }] }),
	component: () => <EditorPage module={editorModule} />,
});
