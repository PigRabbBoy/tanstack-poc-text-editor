import type { ComponentType } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VARIABLE_SAMPLES } from "@/data/variables";
import type { RenderedProps, Snapshot } from "@/editors/types";
import { fillVariablesInHtml } from "@/lib/conventions";

type PreviewPanelProps = {
	snapshot: Snapshot | null;
	Rendered: ComponentType<RenderedProps>;
};

function bytes(text: string): string {
	const size = new TextEncoder().encode(text).length;
	return size < 1024 ? `${size} B` : `${(size / 1024).toFixed(1)} KB`;
}

function Code({ text, testId }: { text: string; testId: string }) {
	return (
		<pre
			data-testid={testId}
			className="whitespace-pre-wrap break-words rounded-lg bg-bml-ink p-4 font-mono text-xs leading-relaxed text-white"
		>
			{text}
		</pre>
	);
}

export function PreviewPanel({ snapshot, Rendered }: PreviewPanelProps) {
	if (!snapshot) {
		return (
			<div className="flex h-full items-center justify-center rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
				Waiting for the editor…
			</div>
		);
	}

	const json = JSON.stringify(snapshot.json, null, 2);

	return (
		<Tabs defaultValue="rendered" className="flex h-full min-h-0 flex-col">
			<TabsList className="w-full justify-start overflow-x-auto">
				<TabsTrigger value="rendered">Rendered</TabsTrigger>
				<TabsTrigger value="filled">Filled</TabsTrigger>
				<TabsTrigger value="markdown">
					Markdown <Badge variant="outline">{bytes(snapshot.markdown)}</Badge>
				</TabsTrigger>
				<TabsTrigger value="html">
					HTML <Badge variant="outline">{bytes(snapshot.html)}</Badge>
				</TabsTrigger>
				<TabsTrigger value="json">
					JSON <Badge variant="outline">{bytes(json)}</Badge>
				</TabsTrigger>
			</TabsList>
			<ScrollArea className="min-h-0 flex-1 rounded-xl border bg-card">
				<div className="p-4">
					<TabsContent value="rendered" data-testid="preview-rendered">
						<Rendered json={snapshot.json} />
					</TabsContent>
					<TabsContent value="filled">
						<p className="eyebrow mb-3 text-muted-foreground">
							HTML export with sample variable values
						</p>
						<div
							data-testid="preview-filled"
							className="prose prose-sm max-w-none [&_mark]:rounded-sm [&_mark]:bg-highlight [&_mark]:px-1"
							// The HTML comes from the user's own editor in this browser.
							// biome-ignore lint/security/noDangerouslySetInnerHtml: local POC preview
							dangerouslySetInnerHTML={{
								__html: fillVariablesInHtml(snapshot.html, VARIABLE_SAMPLES),
							}}
						/>
					</TabsContent>
					<TabsContent value="markdown">
						<Code text={snapshot.markdown} testId="preview-markdown" />
					</TabsContent>
					<TabsContent value="html">
						<Code text={snapshot.html} testId="preview-html" />
					</TabsContent>
					<TabsContent value="json">
						<Code text={json} testId="preview-json" />
					</TabsContent>
				</div>
			</ScrollArea>
		</Tabs>
	);
}
