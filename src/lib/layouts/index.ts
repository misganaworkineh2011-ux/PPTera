// Layout System
// Two-part layout architecture: Content + Slide
//
// Content Layouts: How text/data is structured (boxes, bullets, steps, etc.)
// Slide Layouts: Where the image sits relative to content (left, right, top, etc.)

export * from "./content";
export * from "./slide";

// Re-export specific types for convenience
export type { BoxLayout, BoxLayoutType, BoxContentItem } from "./content/boxes";
export {
  boxLayouts,
  getBoxLayoutById,
  getAllBoxLayouts,
  getRecommendedBoxLayout,
  calculateBoxGridDimensions,
  getBoxLayoutGridTemplate,
} from "./content/boxes";

export type { SequenceLayout, SequenceLayoutType, SequenceContentItem } from "./content/sequence";
export {
  sequenceLayouts,
  getSequenceLayoutById,
  getAllSequenceLayouts,
  getRecommendedSequenceLayout,
} from "./content/sequence";

export type { CircleLayout, CircleLayoutType, CircleContentItem } from "./content/circles";
export {
  circleLayouts,
  getCircleLayoutById,
  getAllCircleLayouts,
  getRecommendedCircleLayout,
  getArcSegmentPath,
  getRingSegmentPath,
  getArcIconPosition,
  getRingIconPosition,
  getArcContentPosition,
  getRingContentPosition,
  getBaseCircleStyles,
} from "./content/circles";

export type { ImageLayout, ImageLayoutType, ImageContentItem } from "./content/images";
export {
  imageLayouts,
  getImageLayoutById,
  getAllImageLayouts,
  getRecommendedImageLayout,
  calculateImageGridDimensions,
  getBaseImageStyles,
} from "./content/images";

export type { BulletLayout, BulletLayoutType, BulletContentItem } from "./content/bullets";
export {
  bulletLayouts,
  getBulletLayoutById,
  getAllBulletLayouts,
  getRecommendedBulletLayout,
  calculateBulletGridDimensions,
  getBaseBulletStyles,
} from "./content/bullets";

export type { StepsLayout, StepsLayoutType, StepContentItem } from "./content/steps";
export {
  stepsLayouts,
  getStepsLayoutById,
  getAllStepsLayouts,
  getRecommendedStepsLayout,
  getBaseStepsStyles,
} from "./content/steps";

export type { SlideLayoutType, ImageSize, SlideLayoutDefinition } from "./slide";
