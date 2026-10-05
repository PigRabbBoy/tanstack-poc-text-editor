'use client';

import * as React from 'react';

import type { PlateEditor, PlateElementProps } from 'platejs/react';

import {
  insertAudioPlaceholder,
  insertFilePlaceholder,
  insertImagePlaceholder,
  insertMedia,
  insertVideoPlaceholder,
} from '@platejs/media';
import {
  AtSignIcon,
  AudioLinesIcon,
  BracesIcon,
  CalendarIcon,
  CodeXmlIcon,
  Columns2Icon,
  Columns4Icon,
  FileUpIcon,
  FilmIcon,
  ImageIcon,
  Link2Icon,
  MinusIcon,
  ChevronRightIcon,
  Code2,
  Columns3Icon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  Heading5Icon,
  Heading6Icon,
  SmileIcon,
  LightbulbIcon,
  ListIcon,
  ListOrdered,
  PenToolIcon,
  PilcrowIcon,
  Quote,
  RadicalIcon,
  Square,
  SuperscriptIcon,
  Table,
  TableOfContentsIcon,
} from 'lucide-react';
import { type TComboboxInputElement, KEYS } from 'platejs';
import { PlateElement } from 'platejs/react';

import {
  insertBlock,
  insertInlineElement,
} from '@/editors/plate/components/editor/transforms';
import { openVariablePicker } from '@/editors/plate/variable-kit';

import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxGroupLabel,
  InlineComboboxInput,
  InlineComboboxItem,
} from './inline-combobox';

type Group = {
  group: string;
  items: {
    icon: React.ReactNode;
    value: string;
    onSelect: (editor: PlateEditor, value: string) => void;
    className?: string;
    focusEditor?: boolean;
    keywords?: string[];
    label?: string;
  }[];
};

const groups: Group[] = [
  {
    // POC: template data first — this is what the quotation editor is for.
    group: 'Template',
    items: [
      {
        focusEditor: false,
        icon: <BracesIcon />,
        keywords: ['variable', 'placeholder', 'field', '{{'],
        label: 'Variable',
        value: 'action_variable',
        onSelect: (editor) => openVariablePicker(editor),
      },
      {
        focusEditor: false,
        icon: <AtSignIcon />,
        keywords: ['mention', 'person', 'user', '@'],
        label: 'Mention',
        value: 'action_mention',
        onSelect: (editor) => {
          editor.tf.insertNodes(
            { type: KEYS.mentionInput, children: [{ text: '' }] },
            { select: true }
          );
        },
      },
    ],
  },
  {
    group: 'Basic blocks',
    items: [
      {
        icon: <PilcrowIcon />,
        keywords: ['paragraph'],
        label: 'Text',
        value: KEYS.p,
      },
      {
        icon: <Heading1Icon />,
        keywords: ['title', 'h1'],
        label: 'Heading 1',
        value: KEYS.h1,
      },
      {
        icon: <Heading2Icon />,
        keywords: ['subtitle', 'h2'],
        label: 'Heading 2',
        value: KEYS.h2,
      },
      {
        icon: <Heading3Icon />,
        keywords: ['subtitle', 'h3'],
        label: 'Heading 3',
        value: KEYS.h3,
      },
      {
        icon: <Heading4Icon />,
        keywords: ['h4'],
        label: 'Heading 4',
        value: KEYS.h4,
      },
      {
        icon: <Heading5Icon />,
        keywords: ['h5'],
        label: 'Heading 5',
        value: KEYS.h5,
      },
      {
        icon: <Heading6Icon />,
        keywords: ['h6'],
        label: 'Heading 6',
        value: KEYS.h6,
      },
      {
        icon: <ListIcon />,
        keywords: ['unordered', 'ul', '-'],
        label: 'Bulleted list',
        value: KEYS.ul,
      },
      {
        icon: <ListOrdered />,
        keywords: ['ordered', 'ol', '1'],
        label: 'Numbered list',
        value: KEYS.ol,
      },
      {
        icon: <Square />,
        keywords: ['checklist', 'task', 'checkbox', '[]'],
        label: 'To-do list',
        value: KEYS.listTodo,
      },
      {
        icon: <ChevronRightIcon />,
        keywords: ['collapsible', 'expandable'],
        label: 'Toggle',
        value: KEYS.toggle,
      },
      {
        icon: <Code2 />,
        keywords: ['```'],
        label: 'Code Block',
        value: KEYS.codeBlock,
      },
      {
        icon: <Table />,
        label: 'Table',
        value: KEYS.table,
      },
      {
        icon: <Quote />,
        keywords: ['citation', 'blockquote', 'quote', '>'],
        label: 'Blockquote',
        value: KEYS.blockquote,
      },
      {
        icon: <MinusIcon />,
        keywords: ['divider', 'separator', 'hr', '---'],
        label: 'Divider',
        value: KEYS.hr,
      },
      {
        description: 'Insert a highlighted block.',
        icon: <LightbulbIcon />,
        keywords: ['note'],
        label: 'Callout',
        value: KEYS.callout,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value, { upsert: true });
      },
    })),
  },
  {
    group: 'Media',
    items: [
      {
        icon: <ImageIcon />,
        keywords: ['picture', 'photo', 'img'],
        label: 'Image',
        value: KEYS.img,
        onSelect: (editor) => {
          insertImagePlaceholder(editor, { select: true });
        },
      },
      {
        icon: <FilmIcon />,
        keywords: ['movie', 'mp4'],
        label: 'Video',
        value: KEYS.video,
        onSelect: (editor) => {
          insertVideoPlaceholder(editor, { select: true });
        },
      },
      {
        icon: <AudioLinesIcon />,
        keywords: ['sound', 'mp3'],
        label: 'Audio',
        value: KEYS.audio,
        onSelect: (editor) => {
          insertAudioPlaceholder(editor, { select: true });
        },
      },
      {
        icon: <FileUpIcon />,
        keywords: ['attachment', 'pdf'],
        label: 'File',
        value: KEYS.file,
        onSelect: (editor) => {
          insertFilePlaceholder(editor, { select: true });
        },
      },
      {
        icon: <CodeXmlIcon />,
        keywords: ['youtube', 'vimeo', 'twitter', 'embed'],
        label: 'Embed',
        value: KEYS.mediaEmbed,
        onSelect: (editor) => {
          void insertMedia(editor, { select: true, type: KEYS.mediaEmbed });
        },
      },
    ],
  },
  {
    group: 'Advanced blocks',
    items: [
      {
        icon: <TableOfContentsIcon />,
        keywords: ['toc'],
        label: 'Table of contents',
        value: KEYS.toc,
      },
      {
        icon: <Columns2Icon />,
        keywords: ['columns', 'layout'],
        label: '2 columns',
        value: 'action_two_columns',
      },
      {
        icon: <Columns3Icon />,
        keywords: ['columns', 'layout'],
        label: '3 columns',
        value: 'action_three_columns',
      },
      {
        icon: <Columns4Icon />,
        keywords: ['columns', 'layout'],
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
        keywords: ['excalidraw'],
        label: 'Excalidraw',
        value: KEYS.excalidraw,
      },
      {
        icon: <Code2 />,
        keywords: [
          'code-drawing',
          'diagram',
          'plantuml',
          'graphviz',
          'flowchart',
          'mermaid',
        ],
        label: 'Code Drawing',
        value: KEYS.codeDrawing,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value, { upsert: true });
      },
    })),
  },
  {
    group: 'Inline',
    items: [
      {
        focusEditor: true,
        icon: <Link2Icon />,
        keywords: ['url', 'href'],
        label: 'Link',
        value: KEYS.link,
      },
      {
        focusEditor: false,
        icon: <SmileIcon />,
        keywords: ['emoji', ':'],
        label: 'Emoji',
        value: 'action_emoji',
      },
      {
        focusEditor: true,
        icon: <CalendarIcon />,
        keywords: ['time'],
        label: 'Date',
        value: KEYS.date,
      },
      {
        focusEditor: true,
        icon: <SuperscriptIcon />,
        keywords: ['citation', 'fn', 'footnote', '[^]'],
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

export function SlashInputElement(
  props: PlateElementProps<TComboboxInputElement>
) {
  const { editor, element } = props;

  return (
    <PlateElement {...props} as="span">
      <InlineCombobox element={element} trigger="/">
        <InlineComboboxInput />

        <InlineComboboxContent>
          <InlineComboboxEmpty>No results</InlineComboboxEmpty>

          {groups.map(({ group, items }) => (
            <InlineComboboxGroup key={group}>
              <InlineComboboxGroupLabel>{group}</InlineComboboxGroupLabel>

              {items.map(
                ({ focusEditor, icon, keywords, label, value, onSelect }) => (
                  <InlineComboboxItem
                    key={value}
                    value={value}
                    onClick={() => onSelect(editor, value)}
                    label={label}
                    focusEditor={focusEditor}
                    group={group}
                    keywords={keywords}
                  >
                    <div className="mr-2 text-muted-foreground">{icon}</div>
                    {label ?? value}
                  </InlineComboboxItem>
                )
              )}
            </InlineComboboxGroup>
          ))}
        </InlineComboboxContent>
      </InlineCombobox>

      {props.children}
    </PlateElement>
  );
}
