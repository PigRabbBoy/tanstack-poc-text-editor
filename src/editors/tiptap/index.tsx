import { type ComponentType, lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { EditorModule, EditorProps, RenderedProps } from "@/editors/types";
import { meta } from "./meta";

/**
 * The route module is imported by the Worker for SSR, but the editor only ever
 * renders on the client. `import.meta.env.SSR` is a build-time constant, so the
 * server build drops the import() branch and all Tiptap code with it.
 */
function serverStub<P>() {
	return Promise.resolve({ default: (() => null) as ComponentType<P> });
}
const LazyEditor = lazy(() =>
	import.meta.env.SSR ? serverStub<EditorProps>() : import("./editor"),
);
const LazyRendered = lazy(() =>
	import.meta.env.SSR ? serverStub<RenderedProps>() : import("./rendered"),
);

function Loading({ label }: { label: string }) {
	return (
		<div
			className="space-y-3 rounded-xl border p-6"
			data-testid="tiptap-loading"
			role="status"
			aria-label={label}
		>
			<Skeleton className="h-8 w-2/3" />
			<Skeleton className="h-4 w-full" />
			<Skeleton className="h-4 w-5/6" />
		</div>
	);
}

function Editor(props: EditorProps) {
	return (
		<Suspense fallback={<Loading label="Loading Tiptap" />}>
			<LazyEditor {...props} />
		</Suspense>
	);
}

function Rendered(props: RenderedProps) {
	return (
		<Suspense fallback={<Loading label="Loading the static renderer" />}>
			<LazyRendered {...props} />
		</Suspense>
	);
}

export const editorModule: EditorModule = { meta, Editor, Rendered };
