/**
 * Ported from the Lexical playground (MIT, (c) Meta Platforms, Inc.):
 * plugins/PagesExtension/PageContentNode @ v0.52.0. Only import paths changed.
 */
import {getExtensionDependencyFromEditor} from '@lexical/extension';
import {
  $create,
  $getDocument,
  $getEditor,
  addClassNamesToElement,
  ElementNode,
  type LexicalNode,
} from 'lexical';

import {$isPageNode, type PageNode} from './PageNode';
import {PagesExtension} from './PagesExtension';

export class PageContentNode extends ElementNode {
  $config() {
    return this.config('page-content', {
      extends: ElementNode,
    });
  }

  createDOM(): HTMLElement {
    const dom = $getDocument().createElement('div');
    addClassNamesToElement(
      dom,
      getExtensionDependencyFromEditor($getEditor(), PagesExtension).config
        .pageContentClass,
    );
    return dom;
  }

  updateDOM(): boolean {
    return false;
  }

  getPageNode(): PageNode {
    const parent = this.getParent();
    if (!$isPageNode(parent))
      throw new Error('PageContentNode: Parent is not a PageNode');
    return parent;
  }

  isShadowRoot(): boolean {
    return true;
  }

  excludeFromCopy(): boolean {
    return true;
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return false;
  }

  canBeEmpty(): boolean {
    return false;
  }
}

export function $createPageContentNode(): PageContentNode {
  return $create(PageContentNode);
}

export function $isPageContentNode(
  node: LexicalNode | null | undefined,
): node is PageContentNode {
  return node instanceof PageContentNode;
}
