'use client';

// POC: the registry menu (minus "Ask AI") extended so every block-level tool
// is reachable from a right-click: all "Turn into" targets from the toolbar,
// copy, insert below, align incl. justify, line height and text/background
// colour for the selected blocks.

import * as React from 'react';

import { LineHeightPlugin } from '@platejs/basic-styles/react';
import {
  BLOCK_CONTEXT_MENU_ID,
  BlockMenuPlugin,
  BlockSelectionPlugin,
  copySelectedBlocks,
} from '@platejs/selection/react';
import { KEYS, PathApi } from 'platejs';
import {
  useEditorPlugin,
  useEditorReadOnly,
  usePluginOption,
} from 'platejs/react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/editors/plate/ui/context-menu';
import { setBlockType } from '@/editors/plate/components/editor/transforms';
import { useIsTouchDevice } from '@/editors/plate/hooks/use-is-touch-device';

import { DEFAULT_COLORS } from './font-color-toolbar-button';
import { turnIntoItems } from './turn-into-toolbar-button';

const TEXT_COLORS = ['black', 'red', 'orange', 'green', 'blue', 'purple', 'magenta'];
const BACKGROUND_COLORS = [
  'light red 3',
  'light orange 3',
  'light yellow 3',
  'light green 3',
  'light cornflower blue 3',
  'light purple 3',
];

const pickColors = (names: string[]) =>
  DEFAULT_COLORS.filter((color) => names.includes(color.name));

function Swatch({ value }: { value: string }) {
  return (
    <span
      className="size-3.5 rounded-sm border border-border"
      style={{ backgroundColor: value }}
    />
  );
}

export function BlockContextMenu({ children }: { children: React.ReactNode }) {
  const { api, editor } = useEditorPlugin(BlockMenuPlugin);
  const isTouch = useIsTouchDevice();
  const readOnly = useEditorReadOnly();
  const openId = usePluginOption(BlockMenuPlugin, 'openId');
  const isOpen = openId === BLOCK_CONTEXT_MENU_ID;

  const blockSelection = editor.getTransforms(BlockSelectionPlugin).blockSelection;

  const handleTurnInto = React.useCallback(
    (type: string) => {
      editor
        .getApi(BlockSelectionPlugin)
        .blockSelection.getNodes()
        .forEach(([, path]) => {
          setBlockType(editor, type, { at: path });
        });
    },
    [editor]
  );

  const handleAlign = React.useCallback(
    (align: 'center' | 'justify' | 'left' | 'right') => {
      editor
        .getTransforms(BlockSelectionPlugin)
        .blockSelection.setNodes({ align });
    },
    [editor]
  );

  const insertParagraphBelow = React.useCallback(() => {
    const nodes = editor.getApi(BlockSelectionPlugin).blockSelection.getNodes();
    const last = nodes.at(-1);
    if (!last) return;
    const at = PathApi.next(last[1]);
    editor.tf.insertNodes(editor.api.create.block({ type: KEYS.p }), {
      at,
      select: true,
    });
    editor.getApi(BlockSelectionPlugin).blockSelection.clear();
    editor.tf.focus();
  }, [editor]);

  const lineHeights =
    editor.getInjectProps(LineHeightPlugin).validNodeValues ?? [];

  if (isTouch) {
    return children;
  }

  return (
    <ContextMenu
      onOpenChange={(open) => {
        if (!open) {
          api.blockMenu.hide();
        }
      }}
      modal={false}
    >
      <ContextMenuTrigger
        asChild
        onContextMenu={(event) => {
          const dataset = (event.target as HTMLElement).dataset;
          const disabled =
            dataset?.slateEditor === 'true' ||
            readOnly ||
            dataset?.plateOpenContextMenu === 'false';

          if (disabled) return event.preventDefault();

          setTimeout(() => {
            api.blockMenu.show(BLOCK_CONTEXT_MENU_ID, {
              x: event.clientX,
              y: event.clientY,
            });
          }, 0);
        }}
      >
        <div className="w-full">{children}</div>
      </ContextMenuTrigger>
      {isOpen && (
        <ContextMenuContent
          className="w-64"
          data-testid="plate-block-context-menu"
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            editor.getApi(BlockSelectionPlugin).blockSelection.focus();
          }}
        >
          <ContextMenuGroup>
            <ContextMenuItem
              onClick={() => {
                blockSelection.removeNodes();
                editor.tf.focus();
              }}
            >
              Delete
            </ContextMenuItem>
            <ContextMenuItem onClick={() => blockSelection.duplicate()}>
              Duplicate
            </ContextMenuItem>
            <ContextMenuItem onClick={() => copySelectedBlocks(editor)}>
              Copy
            </ContextMenuItem>
            <ContextMenuItem onClick={insertParagraphBelow}>
              Insert paragraph below
            </ContextMenuItem>
            <ContextMenuSub>
              <ContextMenuSubTrigger>Turn into</ContextMenuSubTrigger>
              <ContextMenuSubContent className="max-h-[420px] w-52 overflow-y-auto">
                {turnIntoItems.map((item) => (
                  <ContextMenuItem
                    key={item.value}
                    onClick={() => handleTurnInto(item.value)}
                  >
                    {item.icon}
                    {item.label}
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
          </ContextMenuGroup>

          <ContextMenuSeparator />

          <ContextMenuGroup>
            <ContextMenuItem onClick={() => blockSelection.setIndent(1)}>
              Indent
            </ContextMenuItem>
            <ContextMenuItem onClick={() => blockSelection.setIndent(-1)}>
              Outdent
            </ContextMenuItem>
            <ContextMenuSub>
              <ContextMenuSubTrigger>Align</ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-48">
                <ContextMenuItem onClick={() => handleAlign('left')}>
                  Left
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleAlign('center')}>
                  Center
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleAlign('right')}>
                  Right
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleAlign('justify')}>
                  Justify
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSub>
              <ContextMenuSubTrigger>Line height</ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-40">
                {lineHeights.map((value) => (
                  <ContextMenuItem
                    key={String(value)}
                    onClick={() =>
                      blockSelection.setNodes({ lineHeight: value } as any)
                    }
                  >
                    {String(value)}
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSub>
              <ContextMenuSubTrigger>Text color</ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-48">
                {pickColors(TEXT_COLORS).map((color) => (
                  <ContextMenuItem
                    key={color.name}
                    className="capitalize"
                    onClick={() => blockSelection.setTexts({ color: color.value })}
                  >
                    <Swatch value={color.value} />
                    {color.name}
                  </ContextMenuItem>
                ))}
                <ContextMenuItem
                  onClick={() => blockSelection.setTexts({ color: undefined })}
                >
                  Default
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSub>
              <ContextMenuSubTrigger>Background</ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-56">
                {pickColors(BACKGROUND_COLORS).map((color) => (
                  <ContextMenuItem
                    key={color.name}
                    className="capitalize"
                    onClick={() =>
                      blockSelection.setTexts({ backgroundColor: color.value })
                    }
                  >
                    <Swatch value={color.value} />
                    {color.name}
                  </ContextMenuItem>
                ))}
                <ContextMenuItem
                  onClick={() =>
                    blockSelection.setTexts({ backgroundColor: undefined })
                  }
                >
                  None
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
          </ContextMenuGroup>
        </ContextMenuContent>
      )}
    </ContextMenu>
  );
}
