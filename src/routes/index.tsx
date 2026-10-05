import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { BUNDLE_SIZES } from "@/data/bundle-sizes";
import { FEATURE_GROUPS } from "@/data/features";
import { EDITOR_METAS } from "@/editors/metas";
import type { FeatureStatus, FeatureSupport } from "@/editors/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Overview });

const STATUS: Record<
	FeatureStatus,
	{ label: string; className: string; description: string }
> = {
	builtin: {
		label: "Built-in",
		className: "bg-bml-success/15 text-success-text",
		description: "Core or an official package does it out of the box",
	},
	kit: {
		label: "Kit",
		className: "bg-secondary/10 text-secondary",
		description: "Official or community copy-in UI (registry/template)",
	},
	custom: {
		label: "Custom",
		className: "bg-accent text-accent-foreground",
		description: "We had to write it for this POC",
	},
	partial: {
		label: "Partial",
		className: "bg-bml-warning/15 text-warning-text",
		description: "Works with caveats (see note)",
	},
	paid: {
		label: "Paid",
		className: "bg-bml-ink text-white",
		description: "Requires a paid plan; not included",
	},
	unsupported: {
		label: "—",
		className: "bg-muted text-muted-foreground",
		description: "Not available",
	},
};

function StatusCell({ support }: { support: FeatureSupport }) {
	const status = STATUS[support.status];
	const badge = (
		<span
			className={cn(
				"inline-flex rounded-sm px-2 py-0.5 font-label text-xs font-semibold",
				status.className,
			)}
			data-status={support.status}
		>
			{status.label}
		</span>
	);
	if (!support.note) return badge;
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button type="button" className="cursor-help">
					{badge}
				</button>
			</TooltipTrigger>
			<TooltipContent className="max-w-xs">{support.note}</TooltipContent>
		</Tooltip>
	);
}

function Overview() {
	return (
		<div className="mx-auto max-w-[var(--bml-container-max)] space-y-10 px-4 py-8 lg:px-6">
			<header className="space-y-3">
				<p className="eyebrow text-primary-text">Text editor POC</p>
				<h1 className="text-4xl font-semibold md:text-5xl">
					Plate vs BlockNote vs Lexical vs Tiptap
				</h1>
				<p className="max-w-3xl text-lg text-muted-foreground">
					Four editors, one Thai/English sample document, one feature checklist.
					Each page has the editor on the left and a live preview (rendered,
					filled variables, Markdown, HTML, JSON) on the right. The{" "}
					<Link
						to="/research"
						className="text-primary-text underline-offset-4 hover:underline"
					>
						research page
					</Link>{" "}
					covers pros, cons and limitations from the docs.
				</p>
			</header>

			<section
				className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
				aria-label="Editors"
			>
				{EDITOR_METAS.map((meta) => (
					<Link key={meta.id} to={`/${meta.id}`} className="group">
						<Card className="h-full transition-shadow group-hover:shadow-card">
							<CardHeader>
								<CardTitle className="flex items-center justify-between text-xl">
									{meta.name}
									<ArrowRight className="size-4 text-primary-text transition-transform group-hover:translate-x-1" />
								</CardTitle>
								<CardDescription>{meta.tagline}</CardDescription>
							</CardHeader>
							<CardContent className="space-y-2 text-sm">
								<p>
									<span className="eyebrow text-muted-foreground">UI</span>{" "}
									{meta.uiApproach}
								</p>
								{BUNDLE_SIZES[meta.id] && (
									<p>
										<span className="eyebrow text-muted-foreground">
											Route JS
										</span>{" "}
										{BUNDLE_SIZES[meta.id]?.gzipKb} KB gzip
									</p>
								)}
								{meta.inventory.length > 0 && (
									<p>
										<span className="eyebrow text-muted-foreground">Tools</span>{" "}
										{
											meta.inventory.filter(
												(tool) => tool.status === "included",
											).length
										}{" "}
										of {meta.inventory.length} on the page
									</p>
								)}
							</CardContent>
						</Card>
					</Link>
				))}
			</section>

			<section className="space-y-3">
				<div className="flex flex-wrap items-end justify-between gap-3">
					<h2 className="text-2xl font-semibold">Feature checklist</h2>
					<div className="flex flex-wrap gap-2 text-xs">
						{Object.entries(STATUS).map(([key, status]) => (
							<span key={key} className="flex items-center gap-1">
								<span
									className={cn(
										"rounded-sm px-2 py-0.5 font-label font-semibold",
										status.className,
									)}
								>
									{status.label}
								</span>
								<span className="text-muted-foreground">
									{status.description}
								</span>
							</span>
						))}
					</div>
				</div>
				<div className="overflow-x-auto rounded-xl border bg-card">
					<Table data-testid="comparison-table">
						<TableHeader>
							<TableRow>
								<TableHead className="min-w-56">Feature</TableHead>
								{EDITOR_METAS.map((meta) => (
									<TableHead
										key={meta.id}
										className="font-heading text-base text-foreground"
									>
										{meta.name}
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{FEATURE_GROUPS.map((group) => (
								<FeatureGroupRows key={group.id} group={group} />
							))}
						</TableBody>
					</Table>
				</div>
				<p className="text-sm text-muted-foreground">
					Hover a badge for the note recorded while building that page. Route JS
					is the gzipped JS an editor page loads on top of the app shell (
					<code>pnpm bundle-sizes</code>).
				</p>
			</section>

			<section className="grid gap-4 lg:grid-cols-2">
				{EDITOR_METAS.map((meta) => (
					<Card key={meta.id}>
						<CardHeader>
							<CardTitle>{meta.name}: findings from the build</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-sm">
							<ul className="list-disc space-y-1 pl-5">
								{meta.findings.map((finding) => (
									<li key={finding}>{finding}</li>
								))}
							</ul>
							{meta.showcase.length > 0 && (
								<div className="flex flex-wrap gap-1">
									{meta.showcase.map((item) => (
										<Badge key={item} variant="outline">
											{item}
										</Badge>
									))}
								</div>
							)}
							<p className="text-xs text-muted-foreground">
								Packages: <code>{meta.packages.join(", ")}</code>
							</p>
						</CardContent>
					</Card>
				))}
			</section>
		</div>
	);
}

function FeatureGroupRows({
	group,
}: {
	group: (typeof FEATURE_GROUPS)[number];
}) {
	return (
		<>
			<TableRow className="bg-muted hover:bg-muted">
				<TableCell
					colSpan={EDITOR_METAS.length + 1}
					className="eyebrow text-primary-text"
				>
					{group.label}
				</TableCell>
			</TableRow>
			{group.features.map((feature) => (
				<TableRow key={feature.id}>
					<TableCell>{feature.label}</TableCell>
					{EDITOR_METAS.map((meta) => (
						<TableCell key={meta.id}>
							<StatusCell support={meta.features[feature.id]} />
						</TableCell>
					))}
				</TableRow>
			))}
		</>
	);
}
