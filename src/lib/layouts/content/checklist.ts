// Checklist content layouts — check items for takeaways/requirements.
// checklist-style-1: Check Tiles — accent-bar tiles with a filled check badge
// checklist-style-2: Square Ticks — crisp filled checkbox squares, airy grid
// checklist-style-3: Pill Checks — soft full-width pills with ring checks
// checklist-style-4: Ledger Checks — hairline ledger rows, check at the row end
// checklist-style-5: Ring Checks — checks inside completed progress rings
// checklist-style-6: Stamp Cards — cards with a rotated ghost check watermark
// checklist-style-7: Check Rail — check nodes threaded on a vertical rail
// checklist-style-8: Mono Checklist — terminal-style [x] markers, mono labels
// checklist-style-9: Shield Checks — verification shields beside each item
// checklist-style-10: Split Domino — rows split into a tinted check cell and text cell
export type ChecklistLayoutType =
  | "checklist-style-1"
  | "checklist-style-2"
  | "checklist-style-3"
  | "checklist-style-4"
  | "checklist-style-5"
  | "checklist-style-6"
  | "checklist-style-7"
  | "checklist-style-8"
  | "checklist-style-9"
  | "checklist-style-10";
