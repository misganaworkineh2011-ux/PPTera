// Table content layouts — data rows in ten distinct editorial treatments
export type TableLayoutType =
  | "table-style-1" // editorial table: accent top rule, zebra rows, uppercase headers
  | "table-style-2" // numbered ledger: open rows, big row numerals, hairlines only
  | "table-style-3" // split panels: tinted label cell + plain definition cell per row
  | "table-style-4" // accent rail: solid accent label column with white text
  | "table-style-5" // floating rows: separated shadow rows with label chips
  | "table-style-6" // print minimal: right-aligned small-caps labels, luxury spacing
  | "table-style-7" // duo tone: alternating tinted row blocks with inline lead-ins
  | "table-style-8" // grid cells: two-column cell grid with shared hairline borders
  | "table-style-9" // spec sheet: dotted leader lines between label and value
  | "table-style-10"; // hero row: first row as a bold accent block, quiet rows beneath
