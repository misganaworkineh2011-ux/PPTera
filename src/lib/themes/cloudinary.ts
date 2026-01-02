/**
 * Cloudinary helpers for theme assets
 *
 * Convention: Upload theme backgrounds to:
 * pptmaster/themes/{themeId}/background
 *
 * The system will automatically find it based on theme ID.
 */

// Your Cloudinary cloud name
const CLOUDINARY_CLOUD_NAME = "dyycugwup";

// Base URL for Cloudinary assets
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// Base folder for all theme assets
const THEMES_FOLDER = "pptmaster/themes";

// Standard image names (convention)
const BACKGROUND_IMAGE_NAME = "background";

/**
 * Get the public ID for a theme's background image
 * Convention: pptmaster/themes/{themeId}/background
 */
export function getThemeBackgroundPath(themeId: string): string {
  return `${THEMES_FOLDER}/${themeId}/${BACKGROUND_IMAGE_NAME}`;
}

/**
 * Get slide background URL (no transformations - let browser handle sizing)
 * Just pass the theme ID - it automatically finds the background image
 *
 * @param themeId - Theme identifier (e.g., "sprout")
 *
 * @example
 * getSlideBackgroundUrl("sprout")
 * // => "https://res.cloudinary.com/dyycugwup/image/upload/pptmaster/themes/sprout/background"
 */
export function getSlideBackgroundUrl(themeId: string): string {
  const publicId = getThemeBackgroundPath(themeId);
  return `${CLOUDINARY_BASE_URL}/${publicId}`;
}

/**
 * Get thumbnail preview URL (no transformations)
 */
export function getThemePreviewUrl(themeId: string): string {
  const publicId = getThemeBackgroundPath(themeId);
  return `${CLOUDINARY_BASE_URL}/${publicId}`;
}
