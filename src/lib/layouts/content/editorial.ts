// Editorial content layouts — magazine-style numbered rows, edge-badge cards,
// header-band split cards, and widening cascade bars (Gamma-inspired anatomies).
export type EditorialLayoutType =
  | "editorial-numbers" // oversized ghost numerals + uppercase headings, hairline rules
  | "editorial-edge-cards" // stacked cards with the number badge overlapping the left edge
  | "editorial-split-cards" // cards with a filled header band + quiet body, first highlighted
  | "editorial-cascade" // numbered bars widening step by step (escalation)
  | "editorial-rule-grid" // columns: small number, accent rule, bold title, text
  | "editorial-ledger" // rows with a hairline running from the heading to the right edge
  | "editorial-chips" // soft accent-tinted chips with a bold lead-in
  | "editorial-dropcap" // magazine columns opened by an oversized drop-cap numeral
  | "editorial-margin" // book-style margin labels beside a continuous spine
  | "editorial-lede" // a lead story with an accent bar, supporting deck below
  | "editorial-verso" // alternating aligned entries across a center spine
  | "editorial-roman"; // formal centered columns with italic roman numerals
