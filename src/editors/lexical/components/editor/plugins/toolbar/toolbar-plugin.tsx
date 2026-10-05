import { cn } from "@/lib/utils";

// POC: wrap instead of the registry's horizontal ScrollArea, so the editor column
// (half the viewport) shows every control without sideways scrolling.
export function Toolbar({
	className,
	children,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="toolbar"
			className={cn("w-full border-b bg-muted/30", className)}
			{...props}
		>
			<div
				role="toolbar"
				className="flex flex-wrap items-center gap-1 px-2 py-2"
			>
				{children}
			</div>
		</div>
	);
}
