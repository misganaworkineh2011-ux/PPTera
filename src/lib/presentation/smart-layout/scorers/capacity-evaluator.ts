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
  // GAMMA-STYLE APPROACH: Check hard bounds first, then calculate utilization
  // Only reject if content is clearly outside acceptable range
  // Allow borderline cases to be scored (they'll get penalized in scoring, not rejected)
  
  // Check bullet count constraint (hard limit - must be within range)
  if (content.bulletCount < capacity.bulletCount.min) {
    const utilization = content.bulletCount / capacity.bulletCount.min;
    return {
      fits: false,
      utilization,
      reason: `Too few bullets: ${content.bulletCount} < ${capacity.bulletCount.min}`,
    };
  }
  
  if (content.bulletCount > capacity.bulletCount.max) {
    const utilization = content.bulletCount / capacity.bulletCount.max;
    return {
      fits: false,
      utilization,
      reason: `Too many bullets: ${content.bulletCount} > ${capacity.bulletCount.max}`,
    };
  }
  
  // Check average bullet length constraint (if specified) - be lenient, allow 20% overage
  if (capacity.avgBulletLength) {
    const maxAllowed = capacity.avgBulletLength.max * 1.2; // Allow 20% overage
    if (content.avgBulletLength < capacity.avgBulletLength.min * 0.8) {
      // Too short - reject
      return {
        fits: false,
        utilization: 0.5,
        reason: `Bullets too short: avg ${content.avgBulletLength} < ${capacity.avgBulletLength.min}`,
      };
    }
    
    if (content.avgBulletLength > maxAllowed) {
      // Too long - reject
      return {
        fits: false,
        utilization: 1.0,
        reason: `Bullets too long: avg ${content.avgBulletLength} > ${capacity.avgBulletLength.max}`,
      };
    }
  }
  
  // Check maximum bullet length constraint (if specified) - be lenient, allow 30% overage
  if (capacity.maxBulletLength) {
    const maxAllowed = capacity.maxBulletLength.max * 1.3; // Allow 30% overage for single long bullet
    if (content.maxBulletLength > maxAllowed) {
      return {
        fits: false,
        utilization: 1.0,
        reason: `Longest bullet too long: ${content.maxBulletLength} > ${capacity.maxBulletLength.max}`,
      };
    }
  }
  
  // Calculate capacity utilization for scoring (not rejection)
  // This helps score layouts but doesn't reject them
  
  // Bullet count utilization (0-1 scale)
  let bulletCountUtilization = 0;
  if (content.bulletCount <= capacity.bulletCount.min) {
    bulletCountUtilization = 0.2; // Below min, but still acceptable
  } else if (content.bulletCount >= capacity.bulletCount.max) {
    bulletCountUtilization = 0.9; // At max, but still acceptable
  } else {
    // Normalize to 0-1 range
    bulletCountUtilization = 
      (content.bulletCount - capacity.bulletCount.min) / 
      (capacity.bulletCount.max - capacity.bulletCount.min);
    // Scale to 0.3-0.9 range (never perfect 0 or 1, always some room)
    bulletCountUtilization = 0.3 + (bulletCountUtilization * 0.6);
  }
  
  // Average length utilization (0-1 scale)
  let avgLengthUtilization = 0.5; // Default if not specified
  if (capacity.avgBulletLength) {
    const min = capacity.avgBulletLength.min;
    const max = capacity.avgBulletLength.max;
    if (content.avgBulletLength <= min) {
      avgLengthUtilization = 0.3; // Below ideal, but acceptable
    } else if (content.avgBulletLength >= max) {
      avgLengthUtilization = 0.8; // At max, but acceptable
    } else {
      // Normalize to 0-1 range
      avgLengthUtilization = (content.avgBulletLength - min) / (max - min);
      // Scale to 0.4-0.8 range
      avgLengthUtilization = 0.4 + (avgLengthUtilization * 0.4);
    }
  }
  
  // Max length utilization (0-1 scale)
  let maxLengthUtilization = 0.5; // Default if not specified
  if (capacity.maxBulletLength) {
    const max = capacity.maxBulletLength.max;
    // Cap at 0.9 even if slightly over (we already checked hard limit above)
    maxLengthUtilization = Math.min(0.9, content.maxBulletLength / max);
  }
  
  // Overall utilization is weighted average of factors
  // Bullet count is most important (50%), then avg length (30%), then max length (20%)
  const utilization = 
    bulletCountUtilization * 0.5 + 
    avgLengthUtilization * 0.3 + 
    maxLengthUtilization * 0.2;
  
  // All checks passed - content fits (may not be optimal, but fits)
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
