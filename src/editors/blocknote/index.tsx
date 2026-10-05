import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { EditorModule, EditorProps, RenderedProps } from "@/editors/types";
import { meta } from "./meta";

// BlockNote (and its CSS) is only loaded in the browser: the route module is imported
// during SSR, and BlockNote is not designed to render on the server.
const LazyEditor = lazy(() => import("./editor"));
const LazyRendered = lazy(() => import("./rendered"));

function Loading() {
	return (
		<div
			className="space-y-3 rounded-xl border p-6"
			data-testid="blocknote-loading"
		>
			<Skeleton className="h-8 w-2/3" />
			<Skeleton className="h-4 w-full" />
			<Skeleton className="h-4 w-5/6" />
		</div>
	);
}

function Editor(props: EditorProps) {
	return (
		<Suspense fallback={<Loading />}>
			<LazyEditor {...props} />
		</Suspense>
	);
}

function Rendered(props: RenderedProps) {
	return (
		<Suspense fallback={<Loading />}>
			<LazyRendered {...props} />
		</Suspense>
	);
}

export const editorModule: EditorModule = { meta, Editor, Rendered };
