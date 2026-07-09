// Definition list content layouts — term and definition pairs.
// definitionlist-style-1: Glossary — accent-bar rows inside one tile
// definitionlist-style-2: Dictionary Entries — serif terms with hanging-indent definitions
// definitionlist-style-3: Flash Cards — term band on top, definition below
// definitionlist-style-4: Glossary Table — right-aligned small-caps terms beside a rule
// definitionlist-style-5: Brace Notes — a large accent brace introducing each definition
// definitionlist-style-6: Equals Notation — term = definition mapping rows
// definitionlist-style-7: Highlight Terms — highlighted terms flowing inline with text
// definitionlist-style-8: Corner Tags — cards with the term in a folded corner tag
// definitionlist-style-9: Numbered Lexicon — mono index, tracked terms, dotted leaders
// definitionlist-style-10: Arrow Map — term → definition with an accent arrow
// definitionlist-style-11: Sticky Notes — tilted note cards with folded corners
// definitionlist-style-12: Ghost Initials — cards backed by the term's oversized initial
export type DefinitionListLayoutType =
  | "definitionlist-style-1"
  | "definitionlist-style-2"
  | "definitionlist-style-3"
  | "definitionlist-style-4"
  | "definitionlist-style-5"
  | "definitionlist-style-6"
  | "definitionlist-style-7"
  | "definitionlist-style-8"
  | "definitionlist-style-9"
  | "definitionlist-style-10"
  | "definitionlist-style-11"
  | "definitionlist-style-12";
