// Feature / comparison matrix content layout — a ✓/✗ grid across options
// Convention: the FIRST item is the header row — its text holds the column
// names separated by "|" (e.g. "Basic | Pro | Enterprise"). Every following
// item is a feature row: label = the feature name, text = the per-column cells
// separated by "|" (e.g. "✗ | ✓ | ✓", or short values like "5 | 50 | ∞").
// Cell tokens ✓/yes/true render as a check, ✗/no/false as a muted cross,
// ~/partial as a dash, anything else renders as its literal text.
// featurematrix-style-1: Check Grid — accent header, zebra rows, tick cells
// featurematrix-style-2: Card Cells — each cell as its own rounded chip
// featurematrix-style-3: Winner Column — one highlighted "recommended" column
// featurematrix-style-4: Minimal Rules — hairline print table, small-caps header
// featurematrix-style-5: Tinted Columns — each option column softly accent-tinted
// featurematrix-style-6: Column Cards — each option as a card listing its ✓ features
// featurematrix-style-7: Score Ranking — options ranked by their ✓ count with bars
// featurematrix-style-8: Inverse Header — a bold dark header band over the grid
// featurematrix-style-9: Dense Print — a compact tight table for many rows
export type FeatureMatrixLayoutType =
  | "featurematrix-style-1"
  | "featurematrix-style-2"
  | "featurematrix-style-3"
  | "featurematrix-style-4"
  | "featurematrix-style-5"
  | "featurematrix-style-6"
  | "featurematrix-style-7"
  | "featurematrix-style-8"
  | "featurematrix-style-9";
