import { meta as blocknote } from "./blocknote/meta";
import { meta as lexical } from "./lexical/meta";
import { meta as plate } from "./plate/meta";
import { meta as tiptap } from "./tiptap/meta";

/** Metadata only — importing this does not pull any editor code into the bundle. */
export const EDITOR_METAS = [plate, blocknote, lexical, tiptap];
