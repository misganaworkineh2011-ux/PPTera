/**
 * Capacity Evaluator
 * 
 * Evaluates whether slide content fits within a layout's capacity constraints.
 * Calculates capacity utilization and rejects layouts that would overflow.
 */

import type { LayoutCapacity, ContentAnalysis, CapacityEvaluation } from "../types";

/**
 * Evaluate if content fits within layout capacity constraints
 * 
 * Checks bullet count, average bullet length, and maximum bullet length
 * against the layout's capacity constraints. Calculates utilization
 * percentage and rejects if utilization exceeds 90%.
 * 
 * @param capacity - Layout capacity constraints
 * @param content - Content analysis with metrics
 * @returns Capacity evaluation result with fit status and utilization
 * 
 * @example
 * ```typescript
 * const capacity = {
 *   bulletCount: { min: 2, max: 6 },
 *   avgBulletLength: { min: 5, max: 30 },
 *   density: "medium",
 *   supportsImage: true,
 *   spaceRequirement: "narrow-compatible"
 * };
 * 
 * const content = {
 *   bulletCount: 4,
 *   avgBulletLength: 20,
 *   maxBulletLength: 35,
 *   // ... other fields
 * };
 * 
 * const result = evaluateCapacity(capacity, content);
 * // { fits: true, utilization: 0.67 }
 * ```
 */
export function evaluateCapacity(
  capacity: LayoutCapacity,
  content: ContentAnalysis
): CapacityEvaluation {
  if (content.bulletCount < capacity.bulletCount.min) {
    return {
      fits: false,
      utilization: 0,
      reason: `Too few bullets: ${content.bulletCount} < ${capacity.bulletCount.min}`,
    };
  }

  if (content.bulletCount > capacity.bulletCount.max) {
    return {
      fits: false,
      utilization: 1,
      reason: `Too many bullets: ${content.bulletCount} > ${capacity.bulletCount.max}`,
    };
  }

  if (capacity.avgBulletLength) {
    if (content.avgBulletLength > capacity.avgBulletLength.max) {
      return {
        fits: false,
        utilization: 1,
        reason: `Bullets too long: avg ${content.avgBulletLength} > ${capacity.avgBulletLength.max}`,
      };
    }
  }

  if (capacity.maxBulletLength) {
    if (content.maxBulletLength > capacity.maxBulletLength.max) {
      return {
        fits: false,
        utilization: 1,
        reason: `Longest bullet too long: ${content.maxBulletLength} > ${capacity.maxBulletLength.max}`,
      };
    }
  }

  const bulletCountUtilization = normalizeRange(
    content.bulletCount,
    capacity.bulletCount.min,
    capacity.bulletCount.max
  );

  const avgLengthUtilization = capacity.avgBulletLength
    ? normalizeRange(
        content.avgBulletLength,
        capacity.avgBulletLength.min,
        capacity.avgBulletLength.max
      )
    : 0.5;

  const maxLengthUtilization = capacity.maxBulletLength
    ? Math.min(1, content.maxBulletLength / capacity.maxBulletLength.max)
    : 0.5;

  const utilization =
    bulletCountUtilization * 0.5 +
    avgLengthUtilization * 0.3 +
    maxLengthUtilization * 0.2;

  if (utilization > 0.9) {
    return {
      fits: false,
      utilization,
      reason: `utilization too high: ${(utilization * 100).toFixed(1)}%`,
    };
  }

  return {
    fits: true,
    utilization,
  };
}

function normalizeRange(value: number, min: number, max: number): number {
  if (max <= min) {
    return value >= max ? 1 : 0;
  }

  const normalized = (value - min) / (max - min);
  return Math.min(1, Math.max(0, normalized));
}

/**
 * Check if content density matches layout density requirement
 * 
 * @param layoutDensity - Required density level for layout
 * @param contentDensity - Calculated content density
 * @returns True if densities are compatible
 */
export function isDensityCompatible(
  layoutDensity: "low" | "medium" | "high",
  contentDensity: "low" | "medium" | "high"
): boolean {
  // Exact match is always compatible
  if (layoutDensity === contentDensity) {
    return true;
  }
  
  // Medium density layouts can handle low or high content
  if (layoutDensity === "medium") {
    return true;
  }
  
  // Low density layouts can handle low or medium content
  if (layoutDensity === "low" && contentDensity !== "high") {
    return true;
  }
  
  // High density layouts can handle medium or high content
  if (layoutDensity === "high" && contentDensity !== "low") {
    return true;
  }
  
  return false;
}

/**
 * Calculate content density classification
 * 
 * @param content - Content analysis with metrics
 * @returns Density classification (low, medium, high)
 */
export function calculateContentDensity(
  content: ContentAnalysis
): "low" | "medium" | "high" {
  // Use bullet count and average length to determine density
  const densityScore = content.bulletCount * content.avgBulletLength;
  
  // Thresholds based on typical content patterns
  if (densityScore < 100) {
    return "low";
  } else if (densityScore < 300) {
    return "medium";
  } else {
    return "high";
  }
}
