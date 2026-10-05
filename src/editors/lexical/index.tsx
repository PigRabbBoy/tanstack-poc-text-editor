import { type ComponentType, lazy, Suspense } from "react";
import type { EditorModule, EditorProps, RenderedProps } from "@/editors/types";
import { meta } from "./meta";

/** Resolves to an empty component during SSR so the server build drops the editor. */
function serverStub<P>() {
	return Promise.resolve({ default: (() => null) as ComponentType<P> });
}

// The route module is imported during SSR, so the editor (Lexical, shiki,
// katex, base-ui, registry plugins) is only loaded in the browser. The
// import() stays inline in the ternary so `import.meta.env.SSR` removes it
// from the Worker bundle at build time.
const LazyEditor = lazy(() =>
	import.meta.env.SSR ? serverStub<EditorProps>() : import("./editor"),
);
const LazyRendered = lazy(() =>
	import.meta.env.SSR ? serverStub<RenderedProps>() : import("./rendered"),
);

function Loading({ label }: { label: string }) {
	return (
		<div
			className="flex min-h-[60vh] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground"
			data-testid="lexical-loading"
		>
			{label}
		</div>
	);
}

function Editor(props: EditorProps) {
	return (
		<Suspense fallback={<Loading label="Loading Lexical…" />}>
			<LazyEditor {...props} />
		</Suspense>
	);
}

function Rendered(props: RenderedProps) {
	return (
		<Suspense fallback={<p className="text-sm text-muted-foreground">…</p>}>
			<LazyRendered {...props} />
		</Suspense>
	);
}

export const editorModule: EditorModule = { meta, Editor, Rendered };
