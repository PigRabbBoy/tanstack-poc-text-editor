# Text Editor POC

A side-by-side evaluation of four rich-text editors (Plate, BlockNote, Lexical, Tiptap) against one shared document and feature checklist.

## Language

**Editor**:
One of the four libraries under evaluation, each with its own page.
_Avoid_: Library, framework, engine

**Sample document**:
The single Thai/English markdown document every editor loads by default.
_Avoid_: Fixture, demo content

**Snapshot**:
The editor's current document as JSON, HTML and markdown at one moment.
_Avoid_: State, value, output

**Variable**:
A named placeholder such as `{{customer_name}}`, shown as an atomic chip and filled with a value at render time.
_Avoid_: Placeholder, token, merge field

**Mention**:
A reference to a person from the user list, written `[@Name](mention:id)`.
_Avoid_: Tag, at-reference

**Round-trip**:
Exporting a document to markdown and loading that markdown back; lossless when the markdown is unchanged.

**Showcase**:
A capability only one editor offers, demonstrated on that editor's page.

**Feature status**:
How an editor provides a checklist feature: builtin, kit, custom, partial, paid, or unsupported.
