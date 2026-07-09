// Zigzag content layout — alternating left/right flow cards
// zigzag-style-1: Alternating Flow — cards weaving left and right down the slide
// zigzag-style-2: Center Spine — vertical spine, cards alternate sides with nodes
// zigzag-style-3: Diagonal Steps — cards stepping down-right with arrow connectors
// zigzag-style-4: Number Weave — oversized alternating-side numerals, chromeless
// zigzag-style-5: Ribbon Panels — full-width alternating tinted panels
// zigzag-style-6: Connector Arrows — alternating cards joined by S-curve arrows
// zigzag-style-7: Split Rows — number badge and text swap sides each row
// zigzag-style-8: Ghost Weave — cards with a large ghost numeral, slight overlap
export type ZigzagLayoutType =
  | "zigzag-style-1"
  | "zigzag-style-2"
  | "zigzag-style-3"
  | "zigzag-style-4"
  | "zigzag-style-5"
  | "zigzag-style-6"
  | "zigzag-style-7"
  | "zigzag-style-8";
