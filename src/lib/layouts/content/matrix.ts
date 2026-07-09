// 2x2 quadrant matrix content layout — four cells split by axes
// matrix-style-1: Quadrants — seamless 2x2 grid with center divider lines
// matrix-style-2: Axis Matrix — quadrants with labelled X/Y axis arrows
// matrix-style-3: Quadrant Cards — four separated rounded cards with badges
// matrix-style-4: Plotted Bubbles — a plotting field with a bubble per quadrant
// matrix-style-5: Corner Numbers — quadrants with oversized ghost numerals
// matrix-style-6: Header Bands — each quadrant with an accent header band
export type MatrixLayoutType =
  | "matrix-style-1"
  | "matrix-style-2"
  | "matrix-style-3"
  | "matrix-style-4"
  | "matrix-style-5"
  | "matrix-style-6";
