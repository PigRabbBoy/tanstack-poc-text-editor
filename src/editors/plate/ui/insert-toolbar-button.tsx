'use client';

import * as React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import {
  AudioLinesIcon,
  CalendarIcon,
  CodeXmlIcon,
  Columns2Icon,
  Columns4Icon,
  FileUpIcon,
  LightbulbIcon,
  SmileIcon,
  ChevronRightIcon,
  Code2,
  Columns3Icon,
  FileCodeIcon,
  FilmIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  Link2Icon,
  ListIcon,
  ListOrderedIcon,
  MinusIcon,
  PenToolIcon,
  PilcrowIcon,
  PlusIcon,
  QuoteIcon,
  RadicalIcon,
  SquareIcon,
  SuperscriptIcon,
  TableIcon,
  TableOfContentsIcon,
} from 'lucide-react';
import { KEYS } from 'platejs';
import { type PlateEditor, useEditorRef } from 'platejs/react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/editors/plate/ui/dropdown-menu';
import {
  insertBlock,
  insertInlineElement,
} from '@/editors/plate/components/editor/transforms';

import { ToolbarButton, ToolbarMenuGroup } from './toolbar';

type Group = {
  group: string;
  items: Item[];
};

type Item = {
  icon: React.ReactNode;
  value: string;
  onSelect: (editor: PlateEditor, value: string) => void;
  focusEditor?: boolean;
  label?: string;
};

const groups: Group[] = [
  {
    group: 'Basic blocks',
    items: [
      {
        icon: <PilcrowIcon />,
        label: 'Paragraph',
        value: KEYS.p,
      },
      {
        icon: <Heading1Icon />,
        label: 'Heading 1',
        value: 'h1',
      },
      {
        icon: <Heading2Icon />,
        label: 'Heading 2',
        value: 'h2',
      },
      {
        icon: <Heading3Icon />,
        label: 'Heading 3',
        value: 'h3',
      },
      {
        icon: <TableIcon />,
        label: 'Table',
        value: KEYS.table,
      },
      {
        icon: <FileCodeIcon />,
        label: 'Code',
        value: KEYS.codeBlock,
      },
      {
        icon: <QuoteIcon />,
        label: 'Quote',
        value: KEYS.blockquote,
      },
      {
        icon: <MinusIcon />,
        label: 'Divider',
        value: KEYS.hr,
      },
      {
        icon: <LightbulbIcon />,
        label: 'Callout',
        value: KEYS.callout,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: 'Lists',
    items: [
      {
        icon: <ListIcon />,
        label: 'Bulleted list',
        value: KEYS.ul,
      },
      {
        icon: <ListOrderedIcon />,
        label: 'Numbered list',
        value: KEYS.ol,
      },
      {
        icon: <SquareIcon />,
        label: 'To-do list',
        value: KEYS.listTodo,
      },
      {
        icon: <ChevronRightIcon />,
        label: 'Toggle list',
        value: KEYS.toggle,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: 'Media',
    items: [
      {
        icon: <ImageIcon />,
        label: 'Image',
        value: KEYS.img,
      },
      {
        icon: <FilmIcon />,
        label: 'Video',
        value: KEYS.video,
      },
      {
        icon: <AudioLinesIcon />,
        label: 'Audio',
        value: KEYS.audio,
      },
      {
        icon: <FileUpIcon />,
        label: 'File',
        value: KEYS.file,
      },
      {
        icon: <CodeXmlIcon />,
        label: 'Embed',
        value: KEYS.mediaEmbed,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: 'Advanced blocks',
    items: [
      {
        icon: <TableOfContentsIcon />,
        label: 'Table of contents',
        value: KEYS.toc,
      },
      {
        icon: <Columns2Icon />,
        label: '2 columns',
        value: 'action_two_columns',
      },
      {
        icon: <Columns3Icon />,
        label: '3 columns',
        value: 'action_three_columns',
      },
      {
        icon: <Columns4Icon />,
        label: '4 columns',
        value: 'action_four_columns',
      },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        label: 'Equation',
        value: KEYS.equation,
      },
      {
        icon: <PenToolIcon />,
        label: 'Excalidraw',
        value: KEYS.excalidraw,
      },
      {
        icon: <Code2 />,
        label: 'Code Drawing',
        value: KEYS.codeDrawing,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: 'Inline',
    items: [
      {
        icon: <Link2Icon />,
        label: 'Link',
        value: KEYS.link,
      },
      {
        icon: <SmileIcon />,
        label: 'Emoji',
        value: 'action_emoji',
      },
      {
        focusEditor: true,
        icon: <CalendarIcon />,
        label: 'Date',
        value: KEYS.date,
      },
      {
        focusEditor: true,
        icon: <SuperscriptIcon />,
        label: 'Footnote',
        value: 'action_footnote',
      },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        label: 'Inline Equation',
        value: KEYS.inlineEquation,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertInlineElement(editor, value);
      },
    })),
  },
];

export function InsertToolbarButton(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip="Insert" isDropdown>
          <PlusIcon />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex max-h-[500px] min-w-0 flex-col overflow-y-auto"
        align="start"
      >
        {groups.map(({ group, items: nestedItems }) => (
          <ToolbarMenuGroup key={group} label={group}>
            {nestedItems.map(({ icon, label, value, onSelect }) => (
              <DropdownMenuItem
                key={value}
                className="min-w-[180px]"
                onSelect={() => {
                  onSelect(editor, value);
                  editor.tf.focus();
                }}
              >
                {icon}
                {label}
              </DropdownMenuItem>
            ))}
          </ToolbarMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
