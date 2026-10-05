import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { EditorModule, EditorProps, RenderedProps } from "@/editors/types";
import { meta } from "./meta";

// The route module is also imported on the server, so Plate (and the
// browser-only bits of its registry UI: DnD, excalidraw, html2canvas…) are
// split into client chunks that load only when the editor mounts.
const PlateEditor = lazy(() => import("./plate-editor"));
const PlateRendered = lazy(() => import("./plate-rendered"));

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
