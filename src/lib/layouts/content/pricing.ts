// Pricing / plans content layout — tiered plan cards
// Convention: each item is a plan. label = plan name; text = the price on the
// first line, then one feature per line. The second plan (index 1) is treated
// as the highlighted "Most Popular" tier.
// pricing-style-1: Plan Cards — 3 columns, middle tier highlighted
// pricing-style-2: Popular Ribbon — cards with a corner ribbon on the featured tier
// pricing-style-3: Gradient Hero — the featured plan enlarged beside the others
// pricing-style-4: Minimal Tiers — typographic hairline-separated tiers
// pricing-style-5: Stacked Rows — full-width plan rows with the price on the right
// pricing-style-6: Toggle Cards — compact cards with a feature-dot summary
// pricing-style-7: Segmented Toggle — a monthly/annual pill header over the cards
// pricing-style-8: Glass Tiers — frosted glassmorphic plan cards
// pricing-style-9: Spotlight Offer — one plan enlarged and centered
export type PricingLayoutType =
  | "pricing-style-1"
  | "pricing-style-2"
  | "pricing-style-3"
  | "pricing-style-4"
  | "pricing-style-5"
  | "pricing-style-6"
  | "pricing-style-7"
  | "pricing-style-8"
  | "pricing-style-9";
