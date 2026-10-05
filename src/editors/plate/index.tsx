import { type ComponentType, lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { EditorModule, EditorProps, RenderedProps } from "@/editors/types";
import { meta } from "./meta";

/** The server never renders the editor (ClientOnly), so it gets an empty module. */
function serverStub<P>() {
	return Promise.resolve({ default: (() => null) as ComponentType<P> });
}

// The route module is also imported on the server. `import.meta.env.SSR` is a
// build-time constant, so the SSR/worker build drops these chunks (Plate, its
// registry UI, docx-io, excalidraw…) entirely; the client loads them only when
// the editor mounts. Keep each import() inline in its ternary.
const PlateEditor = lazy(() =>
	import.meta.env.SSR ? serverStub<EditorProps>() : import("./plate-editor"),
);
const PlateRendered = lazy(() =>
	import.meta.env.SSR
		? serverStub<RenderedProps>()
		: import("./plate-rendered"),
);

function Loading() {
	return (
		<div className="space-y-3 rounded-xl border p-6">
			<Skeleton className="h-8 w-2/3" />
			<Skeleton className="h-4 w-full" />
			<Skeleton className="h-4 w-5/6" />
		</div>
	);
}

function Editor(props: EditorProps) {
	return (
		<Suspense fallback={<Loading />}>
			<PlateEditor {...props} />
		</Suspense>
	);
}

function Rendered(props: RenderedProps) {
	return (
		<Suspense fallback={<Skeleton className="h-40 w-full" />}>
			<PlateRendered {...props} />
		</Suspense>
	);
}

export const editorModule: EditorModule = { meta, Editor, Rendered };
