/**
 * Context Tracker Module
 * 
 * Exports all context tracking functionality for the smart layout selection system.
 */

export {
  createLayoutSelectionContext,
  trackLayoutUsage,
  getSlidePosition,
  calculateRepetitionPenalty,
  getRecentLayouts,
  wasUsedRecently,
  getCategoryUsageCount,
  getStyleUsageCount,
} from "./context-tracker";
