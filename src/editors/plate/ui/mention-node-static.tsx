import type { TMentionElement } from 'platejs';
import type { SlateElementProps } from 'platejs/static';

import { KEYS } from 'platejs';
import { SlateElement } from 'platejs/static';

import { cn } from '@/lib/utils';
import { inlineSuggestionVariants } from '@/editors/plate/lib/suggestion';

/**
 * POC: emits the shared HTML convention
 * `<span data-type="mention" data-id="u1">@Label</span>` and skips the void's
 * empty text child so the exported HTML stays clean.
 */
export function MentionElementStatic(
  props: SlateElementProps<TMentionElement> & {
    prefix?: string;
  }
) {
  const { prefix = '@' } = props;
  const element = props.element;

  return (
    <SlateElement
      {...props}
      as="span"
      className={cn(
        'inline-block rounded-sm bg-accent px-1.5 py-0.5 align-baseline font-medium text-[0.9em] text-accent-foreground',
        inlineSuggestionVariants(),
        element.children[0][KEYS.bold] === true && 'font-bold',
        element.children[0][KEYS.italic] === true && 'italic',
        element.children[0][KEYS.underline] === true && 'underline'
      )}
      attributes={{
        ...props.attributes,
        'data-type': 'mention',
        'data-id': element.key ?? element.value,
      }}
    >
      {prefix}
      {element.value}
    </SlateElement>
  );
}
