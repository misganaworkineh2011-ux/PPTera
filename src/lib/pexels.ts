// Pexels API utility for fetching stock photos
// Documentation: https://www.pexels.com/api/documentation/

import { env } from "~/env";

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

export interface PexelsSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page?: string;
}

/**
 * Search for photos on Pexels
 * @param query - Search query (e.g., "business meeting", "technology")
 * @param perPage - Number of results per page (max 80)
 * @param page - Page number
 * @returns Array of photo results
 */
export async function searchPexelsPhotos(
  query: string,
  perPage: number = 5,
  page: number = 1
): Promise<PexelsPhoto[]> {
  const apiKey = env.PEXELS_API_KEY;
  
  if (!apiKey) {
    console.warn("PEXELS_API_KEY not configured, returning empty results");
    return [];
  }

  try {
    const url = new URL("https://api.pexels.com/v1/search");
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", String(Math.min(perPage, 80)));
    url.searchParams.set("page", String(page));
    url.searchParams.set("orientation", "landscape"); // Best for slides

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: apiKey,
      },
    });

    if (!response.ok) {
      console.error(`Pexels API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data: PexelsSearchResponse = await response.json();
    return data.photos;
  } catch (error) {
    console.error("Error fetching from Pexels:", error);
    return [];
  }
}

/**
 * Get a single photo from Pexels by ID
 */
export async function getPexelsPhoto(photoId: number): Promise<PexelsPhoto | null> {
  const apiKey = env.PEXELS_API_KEY;
  
  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(`https://api.pexels.com/v1/photos/${photoId}`, {
      headers: {
        Authorization: apiKey,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching photo from Pexels:", error);
    return null;
  }
}

/**
 * Get curated photos from Pexels (for when we don't have a specific query)
 */
export async function getCuratedPhotos(perPage: number = 10): Promise<PexelsPhoto[]> {
  const apiKey = env.PEXELS_API_KEY;
  
  if (!apiKey) {
    return [];
  }

  try {
    const url = new URL("https://api.pexels.com/v1/curated");
    url.searchParams.set("per_page", String(Math.min(perPage, 80)));

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: apiKey,
      },
    });

    if (!response.ok) {
      return [];
    }

    const data: PexelsSearchResponse = await response.json();
    return data.photos;
  } catch (error) {
    console.error("Error fetching curated photos from Pexels:", error);
    return [];
  }
}

/**
 * Extract search keywords from slide content
 */
export function extractKeywordsFromSlide(slide: {
  title: string;
  subtitle?: string;
  bulletPoints?: string[];
}): string {
  // Combine title and first bullet point for a better search query
  const parts = [slide.title];
  
  if (slide.bulletPoints && slide.bulletPoints.length > 0) {
    parts.push(slide.bulletPoints[0]!);
  }
  
  // Clean up and extract main keywords
  const text = parts.join(" ");
  
  // Remove common words and keep the essence
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
    "be", "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "must", "shall", "can", "need", "dare", "ought",
    "used", "this", "that", "these", "those", "what", "which", "who", "whom",
    "how", "when", "where", "why", "all", "each", "every", "both", "few",
    "more", "most", "other", "some", "such", "no", "not", "only", "same",
    "so", "than", "too", "very", "just", "also", "now", "here", "there",
  ]);
  
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
  
  // Take first 3-4 meaningful words
  return words.slice(0, 4).join(" ") || "professional presentation";
}

/**
 * Fetch images for multiple slides
 */
export async function fetchImagesForSlides(
  slides: Array<{
    type: "title" | "content";
    title: string;
    subtitle?: string;
    bulletPoints?: string[];
  }>
): Promise<Map<number, PexelsPhoto | null>> {
  const imageMap = new Map<number, PexelsPhoto | null>();
  
  // Fetch images in parallel but with some batching to avoid rate limits
  const batchSize = 5;
  
  for (let i = 0; i < slides.length; i += batchSize) {
    const batch = slides.slice(i, i + batchSize);
    
    const promises = batch.map(async (slide, batchIndex) => {
      const slideIndex = i + batchIndex;
      
      // For title slides, use the title itself as the search query for relevant images
      if (slide.type === "title") {
        // Extract keywords from the title for a relevant image
        const titleKeywords = extractKeywordsFromSlide({
          title: slide.title,
          subtitle: slide.subtitle,
          bulletPoints: [],
        });
        // Search with more results and pick randomly for variety
        const photos = await searchPexelsPhotos(titleKeywords || "professional business", 5);
        const photo = photos.length > 0 
          ? photos[Math.floor(Math.random() * photos.length)]!
          : null;
        return { index: slideIndex, photo };
      }
      
      const keywords = extractKeywordsFromSlide(slide);
      const photos = await searchPexelsPhotos(keywords, 5);
      
      // Pick a random photo from the results for variety
      const photo = photos.length > 0 
        ? photos[Math.floor(Math.random() * photos.length)]!
        : null;
      
      return { index: slideIndex, photo };
    });
    
    const results = await Promise.all(promises);
    
    for (const { index, photo } of results) {
      imageMap.set(index, photo);
    }
    
    // Small delay between batches to be nice to the API
    if (i + batchSize < slides.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  return imageMap;
}

