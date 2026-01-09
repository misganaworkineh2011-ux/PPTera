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
 * @param themeId - Theme identifier (e.g., "nebula")
 *
 * @example
 * getSlideBackgroundUrl("nebula")
 * // => "https://res.cloudinary.com/dyycugwup/image/upload/pptmaster/themes/nebula/background"
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

/**
 * Transform any Cloudinary URL to add optimization parameters
 * Works with any Cloudinary URL format
 * 
 * @param url - Original Cloudinary URL
 * @param options - Transformation options
 * @returns Optimized Cloudinary URL
 */
export function getOptimizedCloudinaryUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: "auto" | number;
    format?: "auto" | "webp" | "avif" | "jpg" | "png";
  } = {}
): string {
  if (!url || !url.includes("cloudinary.com")) {
    return url;
  }

  const { width = 400, quality = "auto", format = "auto" } = options;

  // Build transformation string
  const transforms: string[] = [];
  if (width) transforms.push(`w_${width}`);
  transforms.push(`q_${quality}`);
  transforms.push(`f_${format}`);
  transforms.push("c_fill"); // Crop to fill dimensions

  const transformString = transforms.join(",");

  // Insert transformations after /upload/
  // Handle both formats:
  // 1. .../upload/v123456/... (with version)
  // 2. .../upload/folder/... (without version)
  const uploadIndex = url.indexOf("/upload/");
  if (uploadIndex === -1) return url;

  const beforeUpload = url.substring(0, uploadIndex + 8); // includes "/upload/"
  const afterUpload = url.substring(uploadIndex + 8);

  return `${beforeUpload}${transformString}/${afterUpload}`;
}

/**
 * Get optimized thumbnail URL for theme preview cards
 * Uses small dimensions and auto quality/format for fast loading
 */
export function getThemeThumbnailUrl(url: string): string {
  return getOptimizedCloudinaryUrl(url, {
    width: 400,
    quality: "auto",
    format: "auto",
  });
}
