import { BaseTocPlugin } from "@platejs/toc";

import { TocElementStatic } from "@/editors/plate/ui/toc-node-static";

export const BaseTocKit = [BaseTocPlugin.withComponent(TocElementStatic)];
