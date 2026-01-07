/**
 * Pricing page utility functions for testable logic
 */

export type PriceDisplayState = 'loading' | 'error' | 'loaded';

export interface PriceDisplayConfig {
  loading: boolean;
  error: string | null;
  isAnnual: boolean;
}

/**
 * Determines the current state of the price display
 */
export function getPriceDisplayState(config: PriceDisplayConfig): PriceDisplayState {
  if (config.loading) return 'loading';
  if (config.error) return 'error';
  return 'loaded';
}

/**
 * Determines if the card structure should be rendered
 * Card structure should ALWAYS be rendered regardless of loading state
 */
export function shouldRenderCardStructure(loading: boolean): boolean {
  return true; // Card structure always renders
}

/**
 * Determines if the skeleton should be shown in the price area
 */
export function shouldShowPriceSkeleton(loading: boolean): boolean {
  return loading;
}

/**
 * Determines if the price value should be shown
 */
export function shouldShowPriceValue(loading: boolean, error: string | null): boolean {
  return !loading && !error;
}

/**
 * Determines if the error indicator should be shown
 */
export function shouldShowPriceError(loading: boolean, error: string | null): boolean {
  return !loading && !!error;
}

/**
 * Card titles that should always be present in the pricing page
 */
export const PRICING_CARD_TITLES = ['Free', 'Plus', 'Pro', 'Ultra'] as const;

/**
 * Validates that all required card elements are present
 */
export function validateCardStructure(cardTitles: string[]): boolean {
  return PRICING_CARD_TITLES.every(title => cardTitles.includes(title));
}
