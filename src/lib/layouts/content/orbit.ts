// Orbit content layouts — relationship/status diagrams built from circles and
// spectra: concentric rings, overlapping circles, phase circles, spectrum line.
// orbit-style-5: Satellites — a core node with small satellite nodes orbiting
// orbit-style-6: Solar System — nested orbit rings with nodes on each ring
// orbit-style-7: Molecule — bonded nodes radiating from a central atom
// orbit-style-8: Gauge Orbit — a semicircle dial of segments around a hub
// orbit-style-9: Radar — concentric radar rings with plotted nodes and spokes
// orbit-style-10: Halo — a soft glowing ring of nodes around a labelled core
// orbit-style-11: Constellation — nodes linked by a connecting star path
// orbit-style-12: Nucleus — overlapping translucent orbit ellipses with nodes
export type OrbitLayoutType =
  | "orbit-rings" // center concept in outline rings, callouts at the cardinal points
  | "orbit-overlap" // three overlapping circles, middle emphasized (Venn-style)
  | "orbit-phases" // circle row where solid vs tint reads as status
  | "orbit-spectrum" // glow dots on a gradient line, label above / text below
  | "orbit-style-5"
  | "orbit-style-6"
  | "orbit-style-7"
  | "orbit-style-8"
  | "orbit-style-9"
  | "orbit-style-10"
  | "orbit-style-11"
  | "orbit-style-12";
