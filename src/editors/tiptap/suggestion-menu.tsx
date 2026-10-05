import { ReactRenderer } from "@tiptap/react";
import type {
	SuggestionKeyDownProps,
	SuggestionOptions,
	SuggestionProps,
} from "@tiptap/suggestion";
import {
	type ReactNode,
	type Ref,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@/components/ui/command";

/** One row in any of our suggestion popups (slash, @mention, {{variable, :emoji). */
export type MenuItem = {
	id: string;
	title: string;
	description?: string;
	group?: string;
	icon?: ReactNode;
	hint?: string;
	keywords?: string[];
};

export type SuggestionMenuHandle = {
	onKeyDown: (props: SuggestionKeyDownProps) => boolean;
};

type SuggestionMenuProps<I extends MenuItem> = SuggestionProps<I, I> & {
	label: string;
	ref?: Ref<SuggestionMenuHandle>;
};

/**
 * Popup list styled with the app's shadcn `Command` primitives. Focus stays in
 * the editor, so keyboard navigation is forwarded from the Suggestion plugin.
 */
function SuggestionMenu<I extends MenuItem>({
	items,
	command,
	label,
	query,
	ref,
}: SuggestionMenuProps<I>) {
	const [index, setIndex] = useState(0);
	const listRef = useRef<HTMLDivElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset highlight whenever the result list changes
	useEffect(() => setIndex(0), [items]);

	useEffect(() => {
		const active = listRef.current?.querySelector('[data-selected="true"]');
		active?.scrollIntoView({ block: "nearest" });
	});

	useImperativeHandle(ref, () => ({
		onKeyDown: ({ event }) => {
			if (items.length === 0) return false;
			if (event.key === "ArrowDown") {
				setIndex((value) => (value + 1) % items.length);
				return true;
			}
			if (event.key === "ArrowUp") {
				setIndex((value) => (value - 1 + items.length) % items.length);
				return true;
			}
			if (event.key === "Enter" || event.key === "Tab") {
				const item = items[index];
				if (item) command(item);
				return true;
			}
			return false;
		},
	}));

	const groups = new Map<string, I[]>();
	for (const item of items) {
		const group = item.group ?? label;
		groups.set(group, [...(groups.get(group) ?? []), item]);
	}

	return (
		<Command
			shouldFilter={false}
			value={items[index]?.id ?? ""}
			className="w-72 border shadow-elevated"
			data-testid="tiptap-suggestion"
			data-query={query}
		>
			<CommandList ref={listRef} className="max-h-80">
				<CommandEmpty>No results for “{query}”</CommandEmpty>
				{[...groups.entries()].map(([group, groupItems]) => (
					<CommandGroup key={group} heading={group}>
						{groupItems.map((item) => (
							<CommandItem
								key={item.id}
								value={item.id}
								onMouseEnter={() => setIndex(items.indexOf(item))}
								onSelect={() => command(item)}
								onMouseDown={(event) => event.preventDefault()}
							>
								{item.icon && (
									<span className="flex size-7 shrink-0 items-center justify-center rounded-sm border bg-background">
										{item.icon}
									</span>
								)}
								<span className="flex min-w-0 flex-col">
									<span className="truncate font-medium">{item.title}</span>
									{item.description && (
										<span className="truncate text-xs text-muted-foreground">
											{item.description}
										</span>
									)}
								</span>
								{item.hint && (
									<span className="ml-auto font-mono text-xs text-muted-foreground">
										{item.hint}
									</span>
								)}
							</CommandItem>
						))}
					</CommandGroup>
				))}
			</CommandList>
		</Command>
	);
}

/** `render` for a Suggestion plugin: React popup positioned by the plugin's built-in floating-ui `mount`. */
export function renderSuggestionMenu<I extends MenuItem>(
	label: string,
): NonNullable<SuggestionOptions<I, I>["render"]> {
	return () => {
		let renderer: ReactRenderer<
			SuggestionMenuHandle,
			SuggestionMenuProps<I>
		> | null = null;
		let unmount: (() => void) | null = null;

		const close = () => {
			unmount?.();
			renderer?.destroy();
			unmount = null;
			renderer = null;
		};

		return {
			onStart: (props) => {
				renderer = new ReactRenderer(SuggestionMenu<I>, {
					props: { ...props, label },
					editor: props.editor,
					className: "z-50",
				});
				unmount = props.mount(renderer.element as HTMLElement);
			},
			onUpdate: (props) => renderer?.updateProps({ ...props, label }),
			// Escape is handled by the plugin itself (it dismisses and calls onExit).
			onKeyDown: (props) => renderer?.ref?.onKeyDown(props) ?? false,
			onExit: close,
		};
	};
}

/** Case-insensitive match on title, id and keywords. */
export function filterItems<I extends MenuItem>(
	items: I[],
	query: string,
	limit = 12,
): I[] {
	const q = query.trim().toLowerCase();
	if (!q) return items.slice(0, limit);
	return items
		.filter((item) =>
			[item.title, item.id, item.description ?? "", ...(item.keywords ?? [])]
				.join(" ")
				.toLowerCase()
				.includes(q),
		)
		.slice(0, limit);
}
