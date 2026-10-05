import { ClientOnly } from "@tanstack/react-router";
import { Download, FileUp, Repeat, RotateCcw } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import sampleMarkdown from "@/data/sample.md?raw";
import type { EditorModule, Snapshot } from "@/editors/types";
import { useStoredValue } from "@/lib/storage";
import { useDebouncedCallback } from "@/lib/use-debounced-callback";
import { PreviewPanel } from "./preview-panel";

type Source =
	| { kind: "stored"; json: unknown }
	| { kind: "markdown"; markdown: string };

type RoundTrip = { before: string; after?: string };

function EditorSkeleton() {
	return (
		<div
			className="space-y-3 rounded-xl border p-6"
			data-testid="editor-skeleton"
		>
			<Skeleton className="h-8 w-2/3" />
			<Skeleton className="h-4 w-full" />
			<Skeleton className="h-4 w-5/6" />
			<Skeleton className="h-4 w-4/6" />
		</div>
	);
}

function download(filename: string, text: string) {
	const url = URL.createObjectURL(new Blob([text], { type: "text/markdown" }));
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}

export function EditorPage({ module }: { module: EditorModule }) {
	const { meta, Editor, Rendered } = module;
	const stored = useStoredValue<unknown>(`doc:${meta.id}`);
	const [source, setSource] = useState<Source | null>(null);
	const [revision, setRevision] = useState(0);
	const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
	const [roundTrip, setRoundTrip] = useState<RoundTrip | null>(null);
	const [importText, setImportText] = useState("");
	const latest = useRef<Snapshot | null>(null);

	// Pick the initial source once localStorage has been read on the client.
	if (stored.loaded && source === null) {
		setSource(
			stored.value === null
				? { kind: "markdown", markdown: sampleMarkdown }
				: { kind: "stored", json: stored.value },
		);
	}

	const publish = useDebouncedCallback((next: Snapshot) => {
		setSnapshot(next);
		stored.save(next.json);
		setRoundTrip((current) =>
			current && current.after === undefined
				? { ...current, after: next.markdown }
				: current,
		);
	}, 250);

	const handleChange = useCallback(
		(next: Snapshot) => {
			latest.current = next;
			publish(next);
		},
		[publish],
	);

	function load(next: Source) {
		setSnapshot(null);
		setSource(next);
		setRevision((value) => value + 1);
	}

	function reset() {
		stored.clear();
		setRoundTrip(null);
		load({ kind: "markdown", markdown: sampleMarkdown });
		toast.success("Reset to the sample document");
	}

	function runRoundTrip() {
		const markdown = latest.current?.markdown;
		if (markdown === undefined) return;
		setRoundTrip({ before: markdown });
		load({ kind: "markdown", markdown });
	}

	const lossless =
		roundTrip?.after !== undefined && roundTrip.after === roundTrip.before;

	return (
		<div className="grid min-h-[calc(100vh-4rem)] gap-6 p-4 lg:grid-cols-2 lg:p-6">
			<section className="flex min-w-0 flex-col gap-4">
				<header className="flex flex-wrap items-end justify-between gap-3">
					<div>
						<p className="eyebrow text-primary-text">Editor</p>
						<h1 className="text-3xl font-semibold">{meta.name}</h1>
						<p className="text-sm text-muted-foreground">{meta.tagline}</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<Dialog>
							<DialogTrigger asChild>
								<Button variant="outline" size="sm">
									<FileUp /> Import MD
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Import markdown</DialogTitle>
									<DialogDescription>
										Replaces the document. Use {"{{name}}"} for variables and
										[@Name](mention:id) for mentions.
									</DialogDescription>
								</DialogHeader>
								<textarea
									className="min-h-48 w-full rounded-lg border bg-background p-3 font-mono text-sm"
									value={importText}
									onChange={(event) => setImportText(event.target.value)}
									aria-label="Markdown to import"
								/>
								<DialogFooter>
									<Button
										onClick={() => {
											setRoundTrip(null);
											load({ kind: "markdown", markdown: importText });
										}}
									>
										Load
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								latest.current &&
								download(`${meta.id}.md`, latest.current.markdown)
							}
						>
							<Download /> Export MD
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={runRoundTrip}
							data-testid="round-trip"
						>
							<Repeat /> Round-trip
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={reset}
							data-testid="reset"
						>
							<RotateCcw /> Reset
						</Button>
					</div>
				</header>
				{roundTrip?.after !== undefined && (
					<div
						data-testid="round-trip-result"
						className="rounded-lg border bg-muted p-3 text-sm"
						data-lossless={lossless}
					>
						<Badge variant={lossless ? "secondary" : "destructive"}>
							{lossless
								? "Markdown round-trip is lossless"
								: "Markdown changed after round-trip"}
						</Badge>
						{!lossless && (
							<details className="mt-2">
								<summary className="cursor-pointer">
									Show before / after
								</summary>
								<div className="mt-2 grid gap-2 md:grid-cols-2">
									<pre className="overflow-auto whitespace-pre-wrap text-xs">
										{roundTrip.before}
									</pre>
									<pre className="overflow-auto whitespace-pre-wrap text-xs">
										{roundTrip.after}
									</pre>
								</div>
							</details>
						)}
					</div>
				)}
				<div
					className="min-w-0 flex-1"
					data-testid="editor-root"
					data-editor={meta.id}
				>
					<ClientOnly fallback={<EditorSkeleton />}>
						{source === null ? (
							<EditorSkeleton />
						) : (
							<Editor
								key={revision}
								initialMarkdown={
									source.kind === "markdown" ? source.markdown : ""
								}
								storedJson={source.kind === "stored" ? source.json : null}
								onChange={handleChange}
							/>
						)}
					</ClientOnly>
				</div>
			</section>
			<section className="flex min-h-[60vh] min-w-0 flex-col lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
				<PreviewPanel snapshot={snapshot} Rendered={Rendered} />
			</section>
		</div>
	);
}
