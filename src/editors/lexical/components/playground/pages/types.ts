/**
 * Ported from the Lexical playground (MIT, (c) Meta Platforms, Inc.):
 * plugins/PagesExtension/types @ v0.52.0. Only import paths changed.
 */
export type PageSize =
  | 'Letter'
  | 'Tabloid'
  | 'Legal'
  | 'Statement'
  | 'Executive'
  | 'Folio'
  | 'A3'
  | 'A4'
  | 'A5'
  | 'B4'
  | 'B5';

export type Orientation = 'portrait' | 'landscape';

export interface PageSetup {
  pageSize: PageSize;
  orientation: Orientation;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}
