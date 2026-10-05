'use client';

// POC: kit for the documented FindReplacePlugin (the registry ships only the
// leaf + a demo). The toolbar UI lives in src/editors/plate/toolbar/.
import { FindReplacePlugin } from '@platejs/find-replace';

import { SearchHighlightLeaf } from '@/editors/plate/ui/search-highlight-node';

export const FindReplaceKit = [
  FindReplacePlugin.configure({
    render: { node: SearchHighlightLeaf },
  }),
];
