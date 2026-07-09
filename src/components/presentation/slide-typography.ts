// Sizes use cqw (container-query width) so they scale against the fixed slide
// canvas (see SlideScaler), not the browser window. Falls back to viewport width
// where there's no slide container (e.g. thumbnails), matching prior behavior.
export const CONTENT_FONT_SIZE = {
  compact: "clamp(0.75rem, 1.2cqw + 0.15rem, 0.9rem)",
  normal: "clamp(0.875rem, 1.4cqw + 0.15rem, 1rem)",
};
