/**
 * Ported verbatim from the Lexical playground (MIT, (c) Meta Platforms, Inc.):
 * plugins/MaxLengthPlugin @ v0.52.0 (an extension with a `disabled` signal).
 */
import {effect, namedSignals} from '@lexical/extension';
import {$trimTextContentFromAnchor} from '@lexical/selection';
import {$restoreEditorState} from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  defineExtension,
  type EditorState,
  RootNode,
  safeCast,
} from 'lexical';

export interface MaxLengthConfig {
  disabled: boolean;
  maxLength: number;
}

export const MaxLengthExtension = defineExtension({
  build: (_editor, config) => namedSignals(config),
  config: safeCast<MaxLengthConfig>({
    disabled: true,
    maxLength: 30,
  }),
  name: '@poc/lexical/playground/MaxLength',
  register: (editor, _config, state) =>
    effect(() => {
      const output = state.getOutput();
      if (output.disabled.value) {
        return;
      }
      const maxLength = output.maxLength.value;
      let lastRestoredEditorState: EditorState | null = null;
      return editor.registerNodeTransform(RootNode, (rootNode: RootNode) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return;
        }
        const prevEditorState = editor.getEditorState();
        const prevTextContentSize = prevEditorState.read(() =>
          rootNode.getTextContentSize(),
        );
        const textContentSize = rootNode.getTextContentSize();
        if (prevTextContentSize !== textContentSize) {
          const delCount = textContentSize - maxLength;
          const anchor = selection.anchor;

          if (delCount > 0) {
            // Restore the old editor state instead if the last
            // text content was already at the limit.
            if (
              prevTextContentSize === maxLength &&
              lastRestoredEditorState !== prevEditorState
            ) {
              lastRestoredEditorState = prevEditorState;
              $restoreEditorState(editor, prevEditorState);
            } else {
              $trimTextContentFromAnchor(editor, anchor, delCount);
            }
          }
        }
      });
    }),
});
