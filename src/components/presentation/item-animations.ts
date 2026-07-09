import { createContext } from "react";
import type { Variants } from "framer-motion";

/**
 * Central library of per-item (content component) entrance animations.
 * Renderers consume these instead of hardcoding one local fade-up so the
 * user-selected style (SlideData.itemAnimation) applies everywhere, and so
 * click-to-reveal builds (SlideData.itemBuild) can drive items one by one.
 */
export type ItemAnimationId =
  | "fade-up"
  | "fade-down"
  | "slide-left"
  | "slide-right"
  | "zoom-in"
  | "zoom-bounce"
  | "flip-up"
  | "blur-in"
  | "rotate-in"
  | "drop-in"
  | "wipe-up"
  | "none";

export const ITEM_ANIMATIONS: Array<{ id: ItemAnimationId; name: string; description: string }> = [
  { id: "fade-up", name: "Fade Up", description: "Rises softly into place (default)" },
  { id: "fade-down", name: "Fade Down", description: "Settles down from above" },
  { id: "slide-left", name: "Slide In · Left", description: "Slides in from the left edge" },
  { id: "slide-right", name: "Slide In · Right", description: "Slides in from the right edge" },
  { id: "zoom-in", name: "Zoom In", description: "Scales up from 80%" },
  { id: "zoom-bounce", name: "Zoom Bounce", description: "Pops in with a springy bounce" },
  { id: "flip-up", name: "Flip Up", description: "Flips up in 3D like a card" },
  { id: "blur-in", name: "Blur In", description: "Sharpens from a soft blur" },
  { id: "rotate-in", name: "Rotate In", description: "Swings in with a slight tilt" },
  { id: "drop-in", name: "Drop In", description: "Drops from above with a bounce" },
  { id: "wipe-up", name: "Wipe Up", description: "Revealed by an upward wipe" },
  { id: "none", name: "None", description: "Items appear instantly" },
];

const EASE = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

export function itemVariantsFor(id?: string): Variants {
  switch (id) {
    case "fade-down":
      return {
        hidden: { opacity: 0, y: -22 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
      };
    case "slide-left":
      return {
        hidden: { opacity: 0, x: -44 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE } },
      };
    case "slide-right":
      return {
        hidden: { opacity: 0, x: 44 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE } },
      };
    case "zoom-in":
      return {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: EASE } },
      };
    case "zoom-bounce":
      return {
        hidden: { opacity: 0, scale: 0.5 },
        visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 320, damping: 17 } },
      };
    case "flip-up":
      return {
        hidden: { opacity: 0, rotateX: 65, y: 16, transformPerspective: 900 },
        visible: { opacity: 1, rotateX: 0, y: 0, transformPerspective: 900, transition: { duration: 0.5, ease: EASE } },
      };
    case "blur-in":
      return {
        hidden: { opacity: 0, filter: "blur(10px)", scale: 0.985 },
        visible: { opacity: 1, filter: "blur(0px)", scale: 1, transition: { duration: 0.5, ease: EASE } },
      };
    case "rotate-in":
      return {
        hidden: { opacity: 0, rotate: -7, scale: 0.92, y: 12 },
        visible: { opacity: 1, rotate: 0, scale: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
      };
    case "drop-in":
      return {
        hidden: { opacity: 0, y: -52 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 15 } },
      };
    case "wipe-up":
      return {
        hidden: { opacity: 0, clipPath: "inset(0 0 100% 0)", y: 8 },
        visible: { opacity: 1, clipPath: "inset(0 0 0% 0)", y: 0, transition: { duration: 0.5, ease: EASE } },
      };
    case "none":
      return {
        hidden: { opacity: 1 },
        visible: { opacity: 1 },
      };
    case "fade-up":
    default:
      return {
        hidden: { opacity: 0, y: 22 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
      };
  }
}

export function containerVariantsFor(id?: string): Variants {
  const instant = id === "none";
  return {
    hidden: { opacity: instant ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: instant ? { duration: 0 } : { staggerChildren: 0.13, delayChildren: 0.1 },
    },
  };
}

/**
 * Click-to-reveal counter, delivered via context instead of props on purpose:
 * SlideRenderer defines its content blocks inline, so re-rendering it (as a
 * prop change would) gives them new component identities and REMOUNTS the
 * subtree — replaying every already-revealed item's entrance on each press.
 * Context updates penetrate the memoized SlideRenderer without re-rendering
 * it, so only the consuming renderer updates and previously revealed items
 * stay perfectly still.
 */
export const RevealContext = createContext<number | undefined>(undefined);

/**
 * Layout families whose renderers consume `revealCount`. Click-to-reveal only
 * engages for these; on other layouts a build slide falls back to the
 * auto-stagger so Next never becomes a dead keypress. Extend this list as
 * more renderers adopt itemMotionProps.
 */
const REVEAL_SUPPORTED_PREFIXES = ["box-", "steps-", "timeline-", "roadmap-", "editorial-", "agenda-", "checklist-", "definitionlist-"];
// Families where only SOME styles consume revealCount (legacy styles keep
// their internal animation plumbing) are listed by exact id instead.
const REVEAL_SUPPORTED_IDS = new Set([
  "bullet-style-5",
  "bullet-style-6",
  "bullet-style-7",
  "bullet-style-8",
  "bullet-style-9",
  "bullet-style-10",
  "bullet-style-11",
  "bullet-style-12",
  "bullet-style-13",
  "sequence-style-5",
  "sequence-style-6",
  "sequence-style-7",
  "sequence-style-8",
  "sequence-style-9",
  "sequence-style-10",
  "sequence-style-11",
  "cascading-style-2",
  "cascading-style-3",
  "cascading-style-4",
  "cascading-style-5",
  "cascading-style-6",
  "cascading-style-7",
  "cascading-style-8",
  "chevron-style-2",
  "chevron-style-3",
  "chevron-style-4",
  "chevron-style-5",
  "chevron-style-6",
  "chevron-style-7",
  "chevron-style-8",
  "chevron-style-9",
  "chevron-style-10",
  "chevron-style-11",
  "chevron-style-12",
  "chevron-style-13",
  "chevron-style-14",
  "chevron-style-15",
  "chevron-style-16",
  "chevron-style-17",
  "chevron-style-18",
  "chevron-style-19",
  "chevron-style-20",
  "chevron-style-21",
  "funnel-style-2",
  "funnel-style-3",
  "funnel-style-4",
  "funnel-style-5",
  "funnel-style-6",
  "showcase-style-2",
  "showcase-style-3",
  "showcase-style-4",
  "showcase-style-5",
  "showcase-style-6",
  "bento-style-2",
  "bento-style-3",
  "bento-style-4",
  "bento-style-5",
  "bento-style-6",
  "icongrid-style-2",
  "icongrid-style-3",
  "icongrid-style-4",
  "icongrid-style-5",
  "icongrid-style-6",
  "zigzag-style-2",
  "zigzag-style-3",
  "zigzag-style-4",
  "zigzag-style-5",
  "zigzag-style-6",
  "zigzag-style-7",
  "zigzag-style-8",
  "team-style-2",
  "team-style-3",
  "team-style-4",
  "team-style-5",
  "team-style-6",
  "team-style-7",
  "team-style-8",
  "cycle-style-2",
  "cycle-style-3",
  "cycle-style-4",
  "cycle-style-5",
  "cycle-style-6",
  "cycle-style-7",
  "cycle-style-8",
  "cycle-style-9",
  "cycle-style-10",
  "cycle-style-11",
  "cycle-style-12",
  "callout-style-2",
  "callout-style-3",
  "callout-style-4",
  "callout-style-5",
  "callout-style-6",
  "callout-style-7",
  "callout-style-8",
  "callout-style-9",
  "callout-style-10",
  "spotlight-style-2",
  "spotlight-style-3",
  "spotlight-style-4",
  "spotlight-style-5",
  "spotlight-style-6",
  "spotlight-style-7",
  "spotlight-style-8",
  "spotlight-style-9",
  "spotlight-style-10",
  "quote-style-3",
  "quote-style-4",
  "quote-style-5",
  "quote-style-6",
  "quote-style-7",
  "quote-style-8",
  "quote-style-9",
  "quote-style-10",
  "quote-style-11",
  "quote-style-12",
  "orbit-style-5",
  "orbit-style-6",
  "orbit-style-7",
  "orbit-style-8",
  "orbit-style-9",
  "orbit-style-10",
  "orbit-style-11",
  "orbit-style-12",
  "circle-style-6",
  "circle-style-7",
  "circle-style-8",
  "circle-style-9",
  "circle-style-10",
  "circle-style-11",
  "circle-style-12",
  "circle-style-13",
  "circle-style-14",
  "chevron-style-22",
  "chevron-style-23",
  "chevron-style-24",
  "chevron-style-25",
  "chevron-style-26",
  "chevron-style-27",
  "chevron-style-28",
  "chevron-style-29",
  "chevron-style-30",
  "hubspoke-style-2",
  "hubspoke-style-3",
  "hubspoke-style-4",
  "hubspoke-style-5",
  "hubspoke-style-6",
  "hubspoke-style-7",
  "hubspoke-style-8",
  "hubspoke-style-9",
  "hubspoke-style-10",
  "pyramid-style-2",
  "pyramid-style-3",
  "pyramid-style-4",
  "pyramid-style-5",
  "pyramid-style-6",
  "pyramid-style-7",
  "pyramid-style-8",
  "pyramid-style-9",
  "pyramid-style-10",
  "matrix-style-2",
  "matrix-style-3",
  "matrix-style-4",
  "matrix-style-5",
  "matrix-style-6",
  "proscons-style-2",
  "proscons-style-3",
  "proscons-style-4",
  "proscons-style-5",
  "proscons-style-6",
  "proscons-style-7",
  "proscons-style-8",
  "proscons-style-9",
  "proscons-style-10",
  "proscons-style-11",
  "proscons-style-12",
  "beforeafter-style-2",
  "beforeafter-style-3",
  "beforeafter-style-4",
  "beforeafter-style-5",
  "beforeafter-style-6",
  "beforeafter-style-7",
  "beforeafter-style-8",
  "beforeafter-style-9",
  "beforeafter-style-10",
  "beforeafter-style-11",
  "beforeafter-style-12",
  "comparison-style-2",
  "comparison-style-3",
  "comparison-style-4",
  "comparison-style-5",
  "comparison-style-6",
  "comparison-style-7",
  "comparison-style-8",
  "comparison-style-9",
  "comparison-style-10",
  "image-style-5",
  "image-style-6",
  "image-style-7",
  "image-style-8",
  "image-style-9",
  "image-style-10",
  "image-style-11",
  "image-style-12",
  "image-style-13",
  "image-style-14",
  "pricing-style-1",
  "pricing-style-2",
  "pricing-style-3",
  "pricing-style-4",
  "pricing-style-5",
  "pricing-style-6",
  "pricing-style-7",
  "pricing-style-8",
  "pricing-style-9",
  "featurematrix-style-1",
  "featurematrix-style-2",
  "featurematrix-style-3",
  "featurematrix-style-4",
  "featurematrix-style-5",
  "featurematrix-style-6",
  "featurematrix-style-7",
  "featurematrix-style-8",
  "featurematrix-style-9",
  "kanban-style-1",
  "kanban-style-2",
  "kanban-style-3",
  "kanban-style-4",
  "kanban-style-5",
  "kanban-style-6",
  "kanban-style-7",
  "kanban-style-8",
  "kanban-style-9",
  "orgchart-style-1",
  "orgchart-style-2",
  "orgchart-style-3",
  "orgchart-style-4",
  "orgchart-style-5",
  "orgchart-style-6",
  "orgchart-style-7",
  "orgchart-style-8",
  "orgchart-style-9",
]);

export function layoutSupportsReveal(layoutId?: string): boolean {
  if (!layoutId) return false;
  return REVEAL_SUPPORTED_IDS.has(layoutId) || REVEAL_SUPPORTED_PREFIXES.some((p) => layoutId.startsWith(p));
}

/**
 * Motion props for one item. When revealCount is set (click-to-reveal build in
 * present mode), each item explicitly animates hidden→visible as the presenter
 * advances; otherwise the container's stagger drives the entrance.
 */
export function itemMotionProps(
  isPresenting: boolean,
  itemAnimation: string | undefined,
  revealCount: number | undefined,
  index: number,
): Record<string, unknown> {
  if (!isPresenting) return {};
  const variants = itemVariantsFor(itemAnimation);
  if (revealCount === undefined) return { variants };
  return {
    variants,
    initial: "hidden" as const,
    animate: index < revealCount ? ("visible" as const) : ("hidden" as const),
  };
}
