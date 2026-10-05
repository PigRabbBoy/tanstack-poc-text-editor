import { useEffect } from "react";
import type { EditorModule, EditorProps, RenderedProps } from "@/editors/types";
import { meta } from "./meta";

function Editor({ initialMarkdown, onChange }: EditorProps) {
	useEffect(() => {
		onChange({
			json: { markdown: initialMarkdown },
			html: "",
			markdown: initialMarkdown,
		});
	}, [initialMarkdown, onChange]);
	return (
		<pre className="whitespace-pre-wrap rounded-xl border p-4">
			{initialMarkdown}
		</pre>
	);
}

function Rendered({ json }: RenderedProps) {
	return <pre className="whitespace-pre-wrap">{JSON.stringify(json)}</pre>;
}

export const editorModule: EditorModule = { meta, Editor, Rendered };
