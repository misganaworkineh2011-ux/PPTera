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
  // Calculate capacity utilization percentage FIRST
  // We use multiple factors to determine overall utilization
  
  // Bullet count utilization
  let bulletCountUtilization = 0;
  if (content.bulletCount < capacity.bulletCount.min) {
    bulletCountUtilization = content.bulletCount / capacity.bulletCount.min;
  } else if (content.bulletCount > capacity.bulletCount.max) {
    bulletCountUtilization = content.bulletCount / capacity.bulletCount.max;
  } else {
    bulletCountUtilization = 
      (content.bulletCount - capacity.bulletCount.min) / 
      (capacity.bulletCount.max - capacity.bulletCount.min);
  }
  
  // Average length utilization
  let avgLengthUtilization = 0.5; // Default if not specified
  if (capacity.avgBulletLength) {
    if (content.avgBulletLength < capacity.avgBulletLength.min) {
      avgLengthUtilization = content.avgBulletLength / capacity.avgBulletLength.min;
    } else if (content.avgBulletLength > capacity.avgBulletLength.max) {
      avgLengthUtilization = content.avgBulletLength / capacity.avgBulletLength.max;
    } else {
      avgLengthUtilization = 
        (content.avgBulletLength - capacity.avgBulletLength.min) / 
        (capacity.avgBulletLength.max - capacity.avgBulletLength.min);
    }
  }
  
  // Max length utilization
  let maxLengthUtilization = 0.5; // Default if not specified
  if (capacity.maxBulletLength) {
    maxLengthUtilization = content.maxBulletLength / capacity.maxBulletLength.max;
  }
  
  // Overall utilization is weighted average of factors
  // Bullet count is most important (50%), then avg length (30%), then max length (20%)
  const utilization = 
    bulletCountUtilization * 0.5 + 
    avgLengthUtilization * 0.3 + 
    maxLengthUtilization * 0.2;
  
  // CHECK UTILIZATION FIRST - Reject if utilization exceeds 90%
  if (utilization > 0.9) {
    return {
      fits: false,
      utilization,
      reason: `Capacity utilization too high: ${(utilization * 100).toFixed(1)}% > 90%`,
    };
  }
  
  // Now check individual bounds (only if utilization is acceptable)
  
  // Check bullet count constraint
  if (content.bulletCount < capacity.bulletCount.min) {
    return {
      fits: false,
      utilization,
      reason: `Too few bullets: ${content.bulletCount} < ${capacity.bulletCount.min}`,
    };
  }
  
  if (content.bulletCount > capacity.bulletCount.max) {
    return {
      fits: false,
      utilization,
      reason: `Too many bullets: ${content.bulletCount} > ${capacity.bulletCount.max}`,
    };
  }
  
  // Check average bullet length constraint (if specified)
  if (capacity.avgBulletLength) {
    if (content.avgBulletLength < capacity.avgBulletLength.min) {
      return {
        fits: false,
        utilization,
        reason: `Bullets too short: avg ${content.avgBulletLength} < ${capacity.avgBulletLength.min}`,
      };
    }
    
    if (content.avgBulletLength > capacity.avgBulletLength.max) {
      return {
        fits: false,
        utilization,
        reason: `Bullets too long: avg ${content.avgBulletLength} > ${capacity.avgBulletLength.max}`,
      };
    }
  }
  
  // Check maximum bullet length constraint (if specified)
  if (capacity.maxBulletLength) {
    if (content.maxBulletLength > capacity.maxBulletLength.max) {
      return {
        fits: false,
        utilization,
        reason: `Longest bullet too long: ${content.maxBulletLength} > ${capacity.maxBulletLength.max}`,
      };
    }
  }
  
  // All checks passed
  return {
    fits: true,
    utilization,
  };
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
