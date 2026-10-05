'use client';

import { TabbablePlugin } from '@platejs/tabbable/react';
import { KEYS } from 'platejs';

export const TabbableKit = TabbablePlugin.configure(({ editor }) => ({
  node: {
    isElement: true,
  },
  options: {
    query: () => {
      if (editor.api.isAt({ start: true }) || editor.api.isAt({ end: true }))
        return false;

      return !editor.api.some({
        match: (n) =>
          !!(
            (n.type &&
              [
                KEYS.codeBlock,
                KEYS.li,
                KEYS.listTodoClassic,
                KEYS.table,
              ].includes(n.type as any)) ||
            n.listStyleType
          ),
      });
    },
  },
  // POC: the registry kit also sets override.enabled.indent = false, which
  // would switch off our IndentKit (lists, toggles). Tab still indents at the
  // start/end of a block and inside lists, where query() returns false.
}));
