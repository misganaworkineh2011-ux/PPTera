// Kanban / status board content layout — columns of status cards
// Convention: each item is a card. Its column is the part of the label before
// the first ":" — e.g. label "Doing: Build the API" places the card in the
// "Doing" column with title "Build the API". Cards without a ":" are spread
// across the columns already seen (or default To Do / In Progress / Done).
// text = an optional card description.
// kanban-style-1: Classic Board — titled columns of cards
// kanban-style-2: Swimlanes — horizontal status lanes
// kanban-style-3: Accent Headers — columns with bold colored header bars
// kanban-style-4: Sticky Notes — cards as tinted sticky notes
// kanban-style-5: Progress Columns — columns with a fill bar showing load
// kanban-style-6: Minimal Board — chromeless columns with hairline dividers
// kanban-style-7: Timeline Board — a progress rail flowing left→right across columns
// kanban-style-8: Glass Columns — frosted translucent column panels
// kanban-style-9: Compact Chips — dense one-line card chips per column
export type KanbanLayoutType =
  | "kanban-style-1"
  | "kanban-style-2"
  | "kanban-style-3"
  | "kanban-style-4"
  | "kanban-style-5"
  | "kanban-style-6"
  | "kanban-style-7"
  | "kanban-style-8"
  | "kanban-style-9";
