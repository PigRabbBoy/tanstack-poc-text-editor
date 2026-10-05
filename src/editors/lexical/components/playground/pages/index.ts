/**
 * Ported from the Lexical playground (MIT, (c) Meta Platforms, Inc.):
 * plugins/PagesExtension/index @ v0.52.0. Only import paths changed.
 */
export {DEFAULT_PAGE_SETUP, PAGE_SIZES} from './constants';
export {
  $createPageContentNode,
  $isPageContentNode,
  PageContentNode,
} from './PageContentNode';
export {$createPageNode, $isPageNode, PageNode} from './PageNode';
export {$getPageSetup, $setPageSetup, pageSetupState} from './pageSetup';
export {type PagesConfig, PagesExtension} from './PagesExtension';
export type {Orientation, PageSetup, PageSize} from './types';
