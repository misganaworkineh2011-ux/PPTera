import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string, maxLength: number = 50): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim()
    .substring(0, maxLength)
    .replace(/-$/, ""); // Remove trailing hyphen
}

/**
 * Generate a presentation URL with slug
 * Format: /presentation/{slug}-{id}
 */
export function getPresentationUrl(id: string, title: string): string {
  const slug = generateSlug(title);
  return `/presentation/${slug}-${id}`;
}
