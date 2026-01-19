/**
 * Comprehensive Logging Utility for Layout Selection
 * 
 * Provides structured logging for the layout selection system with:
 * - Selection logging (category, style, confidence, score)
 * - Score logging (top factors, breakdowns)
 * - Warning logging (low confidence, performance issues)
 * - Error logging (with full context)
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.6
 */

import type {
  LayoutSelection,
  LayoutMatch,
  ContentAnalysis,
  SlideMetadata,
} from "../types";
import type { PerformanceMetrics } from "../layout-selection";

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

/**
 * Logger configuration
 */
interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  prefix: string;
}

/**
 * Default logger configuration
 */
const DEFAULT_CONFIG: LoggerConfig = {
  enabled: true,
  level: LogLevel.INFO,
  prefix: "[layout-selection]",
};

/**
 * Current logger configuration
 */
let config: LoggerConfig = { ...DEFAULT_CONFIG };

/**
 * Configure the logger
 * 
 * @param newConfig - Partial configuration to merge with current config
 */
export function configure(newConfig: Partial<LoggerConfig>): void {
  config = { ...config, ...newConfig };
}

/**
 * Check if logging is enabled for a given level
 */
function shouldLog(level: LogLevel): boolean {
  if (!config.enabled) return false;
  
  const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
  const currentLevelIndex = levels.indexOf(config.level);
  const messageLevelIndex = levels.indexOf(level);
  
  return messageLevelIndex >= currentLevelIndex;
}

/**
 * Format a log message with prefix
 */
function formatMessage(level: LogLevel, message: string): string {
  return `${config.prefix} [${level}] ${message}`;
}

/**
 * Log a selection result
 */
export function logSelection(
  selection: LayoutSelection,
  slideIndex: number,
  metadata?: SlideMetadata
): void {
  if (!shouldLog(LogLevel.INFO)) return;
  
  console.log(
    formatMessage(
      LogLevel.INFO,
      `Slide ${slideIndex}: Selected ${selection.category}/${selection.style} ` +
      `(confidence: ${selection.confidence.toFixed(2)}, score: ${selection.score.toFixed(2)})`
    )
  );
  
  if (metadata) {
    console.log(
      formatMessage(
        LogLevel.DEBUG,
        `  Metadata: ${JSON.stringify(metadata)}`
      )
    );
  }
}

/**
 * Log top scoring factors
 */
export function logTopFactors(
  match: LayoutMatch,
  topN: number = 3
): void {
  if (!shouldLog(LogLevel.DEBUG)) return;
  
  const breakdown = match.scoreBreakdown as Record<string, number>;
  const factors = Object.entries(breakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN);
  
  console.log(
    formatMessage(
      LogLevel.DEBUG,
      `  Top factors: ${factors.map(([k, v]) => `${k}=${v.toFixed(2)}`).join(", ")}`
    )
  );
}

/**
 * Log a warning
 */
export function logWarning(message: string, context?: unknown): void {
  if (!shouldLog(LogLevel.WARN)) return;
  
  console.warn(formatMessage(LogLevel.WARN, message));
  
  if (context && shouldLog(LogLevel.DEBUG)) {
    console.warn(formatMessage(LogLevel.DEBUG, `  Context: ${JSON.stringify(context)}`));
  }
}

/**
 * Log an error
 */
export function logError(message: string, error?: Error, context?: unknown): void {
  if (!shouldLog(LogLevel.ERROR)) return;
  
  console.error(formatMessage(LogLevel.ERROR, message));
  
  if (error) {
    console.error(formatMessage(LogLevel.ERROR, `  Error: ${error.message}`));
    if (error.stack && shouldLog(LogLevel.DEBUG)) {
      console.error(formatMessage(LogLevel.DEBUG, `  Stack: ${error.stack}`));
    }
  }
  
  if (context && shouldLog(LogLevel.DEBUG)) {
    console.error(formatMessage(LogLevel.DEBUG, `  Context: ${JSON.stringify(context)}`));
  }
}

/**
 * Log performance metrics
 */
export function logPerformance(metrics: PerformanceMetrics): void {
  if (!shouldLog(LogLevel.DEBUG)) return;
  
  console.log(
    formatMessage(
      LogLevel.DEBUG,
      `Performance: ${metrics.totalTime.toFixed(2)}ms ` +
      `(analysis: ${metrics.analysisTime.toFixed(2)}ms, ` +
      `scoring: ${metrics.scoringTime.toFixed(2)}ms, ` +
      `selection: ${metrics.selectionTime.toFixed(2)}ms)`
    )
  );
}

/**
 * Log content analysis results
 */
export function logAnalysis(analysis: ContentAnalysis): void {
  if (!shouldLog(LogLevel.DEBUG)) return;
  
  console.log(
    formatMessage(
      LogLevel.DEBUG,
      `Analysis: density=${analysis.density}, ` +
      `structure=${analysis.structure}, ` +
      `patterns=${analysis.patterns.join(", ")}`
    )
  );
}