import type { ShadCNComponents } from "@blocknote/shadcn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Toggle } from "@/components/ui/toggle";

/**
 * Our app's shadcn components (radix-based "new-york") injected into BlockNote.
 *
 * `@blocknote/shadcn` 0.55 is built on **Base UI**: it composes triggers with Base UI's
 * `render={<el/>}` prop, not Radix's `asChild`. Radix DropdownMenu / Popover / Tooltip /
 * Select / Tabs therefore can't be swapped in (menus lose their anchor and `render`
 * leaks to the DOM). Only leaf components that just forward props to a DOM element are
 * compatible, so those are the only ones we override; everything with a trigger keeps
 * BlockNote's bundled Base UI version (which reads the same shadcn CSS variables, so it
 * still picks up the BML theme).
 *
 * The prop types differ slightly (Base UI vs Radix), hence the casts.
 */
export const appShadCNComponents: Partial<ShadCNComponents> = {
	Button: { Button: Button as unknown as ShadCNComponents["Button"]["Button"] },
	Badge: { Badge: Badge as unknown as ShadCNComponents["Badge"]["Badge"] },
	Card: {
		Card: Card as ShadCNComponents["Card"]["Card"],
		CardContent: CardContent as ShadCNComponents["Card"]["CardContent"],
	},
	Input: { Input: Input as unknown as ShadCNComponents["Input"]["Input"] },
	Label: { Label: Label as unknown as ShadCNComponents["Label"]["Label"] },
	Skeleton: { Skeleton: Skeleton as ShadCNComponents["Skeleton"]["Skeleton"] },
	Toggle: { Toggle: Toggle as unknown as ShadCNComponents["Toggle"]["Toggle"] },
};
