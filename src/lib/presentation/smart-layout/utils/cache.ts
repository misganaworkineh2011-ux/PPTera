/**
 * Caching Utilities for Smart Layout Selection
 * 
 * Provides LRU cache implementation and content hashing for
 * caching expensive operations like content analysis.
 * 
 * Requirements: 11.2, 11.3
 */

/**
 * Simple LRU (Least Recently Used) Cache implementation
 * 
 * Features:
 * - O(1) get and set operations
 * - Automatic eviction of least recently used items
 * - Configurable size limit
 * - Memory-efficient using Map
 */
export class LRUCache<K, V> {
  private cache: Map<K, V>;
  private readonly maxSize: number;

  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  /**
   * Get a value from the cache
   * Moves the item to the end (most recently used)
   */
  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }
    
    // Move to end (most recently used)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }

  /**
   * Set a value in the cache
   * Evicts least recently used item if at capacity
   */
  set(key: K, value: V): void {
    // If key exists, delete it first (to update position)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, value);
  }

  /**
   * Check if key exists in cache
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete a key from the cache
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get current cache size
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; utilization: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      utilization: this.cache.size / this.maxSize,
    };
  }
}

/**
 * Generate a hash key for content analysis caching
 * 
 * Creates a deterministic hash from title and bullets that can be
 * used as a cache key. Uses a simple but fast hashing approach.
 * 
 * @param title - Slide title
 * @param bullets - Array of bullet points
 * @returns Hash string for cache key
 */
export function generateContentHash(title: string, bullets: string[]): string {
  // Combine title and bullets into a single string
  const content = `${title}|${bullets.join('|')}`;
  
  // Simple hash function (djb2 algorithm)
  let hash = 5381;
  for (let i = 0; i < content.length; i++) {
    hash = ((hash << 5) + hash) + content.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return hash.toString(36);
}

/**
 * Generate a hash key for regex pattern matching results
 * 
 * @param text - Text that was matched
 * @param patternName - Name of the pattern
 * @returns Hash string for cache key
 */
export function generatePatternHash(text: string, patternName: string): string {
  const content = `${patternName}:${text}`;
  
  let hash = 5381;
  for (let i = 0; i < content.length; i++) {
    hash = ((hash << 5) + hash) + content.charCodeAt(i);
    hash = hash & hash;
  }
  
  return hash.toString(36);
}

// ============================================================================
// GLOBAL CACHE INSTANCES
// ============================================================================

/**
 * Content analysis cache
 * Caches ContentAnalysis results keyed by content hash
 * Size limit: 100 entries (typical presentation has 10-20 slides)
 */
export const contentAnalysisCache = new LRUCache<string, unknown>(100);

/**
 * Pattern matching cache
 * Caches regex match results for identical inputs
 * Size limit: 200 entries (multiple patterns per slide)
 */
export const patternMatchCache = new LRUCache<string, boolean>(200);

/**
 * Clear all caches
 * Call this on memory pressure or when starting a new presentation
 */
export function clearAllCaches(): void {
  contentAnalysisCache.clear();
  patternMatchCache.clear();
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats(): {
  contentAnalysis: { size: number; maxSize: number; utilization: number };
  patternMatch: { size: number; maxSize: number; utilization: number };
} {
  return {
    contentAnalysis: contentAnalysisCache.getStats(),
    patternMatch: patternMatchCache.getStats(),
  };
}
