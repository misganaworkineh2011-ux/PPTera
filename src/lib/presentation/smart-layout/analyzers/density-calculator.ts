/**
 * Content Density Calculator Module
 * 
 * Calculates content density metrics to help determine layout capacity requirements.
 * Density affects which layouts can effectively display the content.
 */

/**
 * Content density metrics
 */
export interface ContentDensityMetrics {
  bulletCount: number;
  avgBulletLength: number;
  maxBulletLength: number;
  totalWordCount: number;
  density: "low" | "medium" | "high";
}

/**
 * Count words in a text string
 * 
 * @param text - Text to count words in
 * @returns Number of words
 */
function countWords(text: string): number {
  if (!text || text.trim().length === 0) {
    return 0;
  }
  
  // Split by whitespace and filter out empty strings
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Calculate content density metrics from bullet points
 * 
 * @param bullets - Array of bullet point strings
 * @returns Content density metrics
 */
export function calculateContentDensity(bullets: string[]): ContentDensityMetrics {
  // Handle empty input
  if (!bullets || bullets.length === 0) {
    return {
      bulletCount: 0,
      avgBulletLength: 0,
      maxBulletLength: 0,
      totalWordCount: 0,
      density: "low",
    };
  }

  // Calculate metrics
  const bulletCount = bullets.length;
  const wordCounts = bullets.map(bullet => countWords(bullet));
  const totalWordCount = wordCounts.reduce((sum, count) => sum + count, 0);
  const avgBulletLength = totalWordCount / bulletCount;
  const maxBulletLength = Math.max(...wordCounts, 0);

  // Classify density based on bullet count and average length
  let density: "low" | "medium" | "high";
  
  if (bulletCount <= 3 && avgBulletLength <= 15) {
    // Few bullets with short text = low density
    density = "low";
  } else if (bulletCount >= 7 || avgBulletLength >= 25) {
    // Many bullets or long text = high density
    density = "high";
  } else {
    // Everything else = medium density
    density = "medium";
  }

  return {
    bulletCount,
    avgBulletLength: Math.round(avgBulletLength * 10) / 10, // Round to 1 decimal
    maxBulletLength,
    totalWordCount,
    density,
  };
}

/**
 * Calculate content density from title and bullets
 * 
 * @param title - Slide title
 * @param bullets - Array of bullet points
 * @returns Content density metrics (bullets only, title not included in metrics)
 */
export function calculateContentDensityFromSlide(
  title: string,
  bullets: string[]
): ContentDensityMetrics {
  // We only calculate density for bullets, not title
  // Title is handled separately in layout selection
  return calculateContentDensity(bullets);
}
