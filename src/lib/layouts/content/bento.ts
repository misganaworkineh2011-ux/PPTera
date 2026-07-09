// Bento grid content layout — asymmetric card mosaic with a hero card
// bento-style-1: Bento Mosaic — one hero card plus supporting tiles in a mosaic
// bento-style-2: Banner Hero — hero spans the full top row, tiles beneath
// bento-style-3: Even Quilt — uniform tiles, alternating accent tint, no hero
// bento-style-4: Right Hero — hero full-height on the right, tiles stacked left
// bento-style-5: Pinwheel — center accent tile framed by four corner tiles
// bento-style-6: Stack Bento — full-width rows, first an accent hero, rest surface
export type BentoLayoutType =
  | "bento-style-1"
  | "bento-style-2"
  | "bento-style-3"
  | "bento-style-4"
  | "bento-style-5"
  | "bento-style-6";
