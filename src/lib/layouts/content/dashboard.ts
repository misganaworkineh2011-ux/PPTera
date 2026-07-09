// KPI dashboard layouts — headline metrics in twelve premium treatments
export type DashboardLayoutType =
  | "dashboard-style-1" // metric cards: tile grid with accent top bars
  | "dashboard-style-2" // stat rail: open columns, huge gradient numerals, hairline dividers
  | "dashboard-style-3" // metric pills: numerals in soft accent pills, centered captions
  | "dashboard-style-4" // hero metric: one dominant KPI + compact supporting stat rail
  | "dashboard-style-5" // progress bars: label + numeral rows with accent completion bars
  | "dashboard-style-6" // ring gauges: 270-degree arc rings with numerals centered
  | "dashboard-style-7" // ticker board: inverted contrast tiles like a market ticker
  | "dashboard-style-8" // leaderboard: ranked rows with right-aligned values and trend chips
  | "dashboard-style-9" // dot matrix: percent as filled-vs-outline dot grids per metric
  | "dashboard-style-10" // corner stats: quadrant cross with stats anchored to corners
  | "dashboard-style-11" // sparkline cards: trend cards with decorative mini area charts
  | "dashboard-style-12"; // badge stack: numerals in gradient squircle badges with captions
