// Hub & spoke content layout — central hub with radiating spokes
// hubspoke-style-1: Radial Hub — hub node with spoke cards on an ellipse
// hubspoke-style-2: Satellite Cards — hub with connector lines to spoke cards
// hubspoke-style-3: Sun Rays — a glowing hub emitting rays to labelled nodes
// hubspoke-style-4: Left Hub — hub on the left with spokes fanning to the right
// hubspoke-style-5: Numbered Spokes — hub with numbered spoke chips around it
// hubspoke-style-6: Gear Hub — hub framed by a cog with tooth-mounted spokes
// hubspoke-style-7: Bubble Cluster — hub bubble surrounded by size-varied bubbles
// hubspoke-style-8: Mind Map — a central node branching to curved-line spokes
// hubspoke-style-9: Orbit Hub — hub inside a ring with spokes docked on the ring
// hubspoke-style-10: Spotlight Hub — a hub with spokes as a surrounding grid
export type HubSpokeLayoutType =
  | "hubspoke-style-1"
  | "hubspoke-style-2"
  | "hubspoke-style-3"
  | "hubspoke-style-4"
  | "hubspoke-style-5"
  | "hubspoke-style-6"
  | "hubspoke-style-7"
  | "hubspoke-style-8"
  | "hubspoke-style-9"
  | "hubspoke-style-10";
