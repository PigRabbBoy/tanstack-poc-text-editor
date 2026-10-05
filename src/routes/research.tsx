import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Minus, Plus, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RESEARCH, type ResearchEntry } from "@/data/research";

export const Route = createFileRoute("/research")({
	head: () => ({ meta: [{ title: "Research · Text Editor POC" }] }),
	component: Research,
});

const compact = new Intl.NumberFormat("en", {
	notation: "compact",
	maximumFractionDigits: 1,
});

function BulletList({
	items,
	icon,
	tone,
}: {
	items: string[];
	icon: React.ReactNode;
	tone: string;
}) {
	return (
		<ul className="space-y-2 text-sm">
			{items.map((item) => (
				<li key={item} className="flex gap-2">
					<span className={`mt-0.5 shrink-0 ${tone}`}>{icon}</span>
					<span>{item}</span>
				</li>
			))}
		</ul>
	);
}

function StatsTable() {
	const rows: {
		label: string;
		value: (entry: ResearchEntry) => React.ReactNode;
	}[] = [
		{ label: "Engine", value: (entry) => entry.engine.split(" (")[0] },
		{
			label: "Version",
			value: (entry) => `${entry.version} (${entry.releasedAt})`,
		},
		{ label: "License", value: (entry) => entry.license.split(" (")[0] },
		{
			label: "GitHub stars",
			value: (entry) => compact.format(entry.stats.githubStars),
		},
		{
			label: "Open issues + PRs",
			value: (entry) => compact.format(entry.stats.openIssues),
		},
		{
			label: "Weekly downloads",
			value: (entry) => (
				<span>
					{compact.format(entry.stats.weeklyDownloads)}{" "}
					<code className="text-xs text-muted-foreground">
						{entry.stats.downloadsPackage}
					</code>
				</span>
			),
		},
		{
			label: "Paid offering",
			value: (entry) =>
				entry.paid.length ? entry.paid[0]?.split(":")[0] : "None",
		},
	];

	return (
		<div className="overflow-x-auto rounded-xl border bg-card">
			<Table className="table-fixed min-w-3xl">
				<TableHeader>
					<TableRow>
						<TableHead className="w-44" />
						{RESEARCH.editors.map((entry) => (
							<TableHead
								key={entry.id}
								className="font-heading text-base text-foreground"
							>
								<Link to={`/${entry.id}`} className="hover:text-primary-text">
									{entry.name}
								</Link>
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{rows.map((row) => (
						<TableRow key={row.label}>
							<TableCell className="eyebrow text-muted-foreground">
								{row.label}
							</TableCell>
							{RESEARCH.editors.map((entry) => (
								<TableCell
									key={entry.id}
									className="whitespace-normal align-top text-sm"
								>
									{row.value(entry)}
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

function EditorResearch({ entry }: { entry: ResearchEntry }) {
	return (
		<div className="space-y-6" data-testid={`research-${entry.id}`}>
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Overview</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 text-sm">
						<p className="text-base">{entry.tagline}</p>
						<dl className="grid grid-cols-[8rem_1fr] gap-x-3 gap-y-2">
							<dt className="eyebrow text-muted-foreground">Engine</dt>
							<dd>{entry.engine}</dd>
							<dt className="eyebrow text-muted-foreground">Document</dt>
							<dd>{entry.documentModel}</dd>
							<dt className="eyebrow text-muted-foreground">Maintainer</dt>
							<dd>{entry.maintainer}</dd>
							<dt className="eyebrow text-muted-foreground">License</dt>
							<dd>{entry.license}</dd>
							{entry.releaseCadence && (
								<>
									<dt className="eyebrow text-muted-foreground">Cadence</dt>
									<dd>{entry.releaseCadence}</dd>
								</>
							)}
							{entry.bundleSizeGzip && (
								<>
									<dt className="eyebrow text-muted-foreground">Bundle</dt>
									<dd>{entry.bundleSizeGzip}</dd>
								</>
							)}
						</dl>
						{entry.paid.length > 0 && (
							<div>
								<p className="eyebrow mb-1 text-muted-foreground">Paid parts</p>
								<ul className="list-disc space-y-1 pl-5">
									{entry.paid.map((item) => (
										<li key={item}>{item}</li>
									))}
								</ul>
							</div>
						)}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Features</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-sm">
						{entry.features.map((group) => (
							<div key={group.group}>
								<p className="eyebrow mb-1 text-primary-text">{group.group}</p>
								<ul className="list-disc space-y-1 pl-5">
									{group.items.map((item) => (
										<li key={item}>{item}</li>
									))}
								</ul>
							</div>
						))}
					</CardContent>
				</Card>
			</div>
			<div className="grid gap-4 lg:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle>Pros</CardTitle>
					</CardHeader>
					<CardContent>
						<BulletList
							items={entry.pros}
							icon={<Plus className="size-4" />}
							tone="text-bml-success"
						/>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Cons</CardTitle>
					</CardHeader>
					<CardContent>
						<BulletList
							items={entry.cons}
							icon={<Minus className="size-4" />}
							tone="text-destructive"
						/>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Limitations &amp; gotchas</CardTitle>
					</CardHeader>
					<CardContent>
						<BulletList
							items={entry.limitations}
							icon={<TriangleAlert className="size-4" />}
							tone="text-bml-warning"
						/>
					</CardContent>
				</Card>
			</div>
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Best for</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="list-disc space-y-1 pl-5 text-sm">
							{entry.bestFor.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Not a fit</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="list-disc space-y-1 pl-5 text-sm">
							{entry.notFor.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>
					</CardContent>
				</Card>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Sources</CardTitle>
				</CardHeader>
				<CardContent>
					<ul className="grid gap-1 text-sm md:grid-cols-2">
						{entry.sources.map((source) => (
							<li key={source.url}>
								<a
									href={source.url}
									target="_blank"
									rel="noreferrer"
									className="inline-flex items-center gap-1 text-[var(--bml-color-link)] hover:underline"
								>
									{source.label} <ExternalLink className="size-3" />
								</a>
							</li>
						))}
					</ul>
				</CardContent>
			</Card>
		</div>
	);
}

function Research() {
	const first = RESEARCH.editors[0]?.id ?? "plate";
	return (
		<div className="mx-auto max-w-[var(--bml-container-max)] space-y-8 px-4 py-8 lg:px-6">
			<header className="space-y-2">
				<p className="eyebrow text-primary-text">Research</p>
				<h1 className="text-4xl font-semibold">
					Features, pros, cons and limitations
				</h1>
				<p className="max-w-3xl text-muted-foreground">
					Desk research from official docs, GitHub and npm, as of{" "}
					{RESEARCH.asOf}. The hands-on results from building each page live on
					the <Link to="/">overview</Link> and on each editor page.
				</p>
				<div className="flex flex-wrap gap-2 pt-1">
					{RESEARCH.notes.map((note) => (
						<Badge
							key={note}
							variant="outline"
							className="whitespace-normal text-left"
						>
							{note}
						</Badge>
					))}
				</div>
			</header>
			<StatsTable />
			<Tabs defaultValue={first}>
				<TabsList>
					{RESEARCH.editors.map((entry) => (
						<TabsTrigger key={entry.id} value={entry.id}>
							{entry.name}
						</TabsTrigger>
					))}
				</TabsList>
				{RESEARCH.editors.map((entry) => (
					<TabsContent key={entry.id} value={entry.id} className="pt-4">
						<EditorResearch entry={entry} />
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
}
