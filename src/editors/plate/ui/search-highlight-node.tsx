'use client';

import { type PlateLeafProps, PlateLeaf } from 'platejs/react';

export function SearchHighlightLeaf(props: PlateLeafProps) {
  // POC: BML highlight token instead of bg-yellow-100; data attribute for e2e.
  return (
    <PlateLeaf
      {...props}
      className="bg-highlight"
      attributes={{ ...props.attributes, 'data-search-highlight': 'true' } as any}
    />
  );
}
