import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRoute,
	HeadContent,
	Link,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import appCss from "../styles.css?url";

const FONTS =
	"https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Work+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@500;600;700&family=Anuphan:wght@400;500;600;700&display=swap";

const NAV = [
	{ to: "/", label: "Overview" },
	{ to: "/research", label: "Research" },
	{ to: "/plate", label: "Plate" },
	{ to: "/blocknote", label: "BlockNote" },
	{ to: "/lexical", label: "Lexical" },
	{ to: "/tiptap", label: "Tiptap" },
] as const;

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "Text Editor POC · Boonmee Lab" },
		],
		links: [
			{ rel: "preconnect", href: "https://fonts.googleapis.com" },
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{ rel: "stylesheet", href: FONTS },
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", type: "image/png", href: "/brand/logomark.png" },
		],
	}),
	shellComponent: RootDocument,
});

function Header() {
	return (
		<header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
			<div className="flex h-16 items-center gap-6 px-4 lg:px-6">
				<Link
					to="/"
					className="flex shrink-0 items-center gap-3"
					aria-label="Boonmee Lab — home"
				>
					<img src="/brand/logomark.png" alt="" width={32} height={32} />
					<img
						src="/brand/wordmark.png"
						alt="Boonmee Lab"
						width={137}
						height={16}
						className="hidden sm:block"
					/>
				</Link>
				<nav className="flex gap-1 overflow-x-auto" aria-label="Main">
					{NAV.map((item) => (
						<Link
							key={item.to}
							to={item.to}
							activeOptions={{ exact: true }}
							className="whitespace-nowrap rounded-md px-3 py-2 font-label text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
							activeProps={{ className: "bg-accent text-accent-foreground" }}
						>
							{item.label}
						</Link>
					))}
				</nav>
			</div>
		</header>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="th">
			<head>
				<HeadContent />
			</head>
			<body>
				<TooltipProvider>
					<Header />
					<main>{children}</main>
				</TooltipProvider>
				<Toaster />
				{import.meta.env.DEV && (
					<TanStackDevtools
						config={{ position: "bottom-right" }}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
						]}
					/>
				)}
				<Scripts />
			</body>
		</html>
	);
}
