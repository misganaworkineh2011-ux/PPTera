import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  getPriceDisplayState,
  shouldRenderCardStructure,
  shouldShowPriceSkeleton,
  shouldShowPriceValue,
  shouldShowPriceError,
  validateCardStructure,
  PRICING_CARD_TITLES,
  type PriceDisplayConfig,
} from './pricing-utils';

/**
 * **Feature: pricing-page-improvements, Property 1: Card structure renders independently of loading state**
 * **Validates: Requirements 3.1**
 * 
 * For any loading state (true or false), the pricing page should render all four 
 * pricing card containers with their titles, descriptions, and feature lists visible.
 */
describe('Property 1: Card structure renders independently of loading state', () => {
  it('should always render card structure regardless of loading state', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // loading state
        (loading) => {
          // Card structure should always render, regardless of loading state
          const shouldRender = shouldRenderCardStructure(loading);
          expect(shouldRender).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate that all four card titles are always required', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // loading state
        fc.boolean(), // isAnnual state
        fc.option(fc.string(), { nil: null }), // error state
        (loading, isAnnual, error) => {
          // Regardless of any state, all four cards should be present
          const allCardsPresent = validateCardStructure([...PRICING_CARD_TITLES]);
          expect(allCardsPresent).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: pricing-page-improvements, Property 2: Price skeleton appears during loading**
 * **Validates: Requirements 3.2**
 * 
 * For any loading state where loading === true, the price display area should 
 * contain a skeleton loader element instead of price text.
 */
describe('Property 2: Price skeleton appears during loading', () => {
  it('should show skeleton when loading is true', () => {
    fc.assert(
      fc.property(
        fc.constant(true), // loading is always true for this property
        fc.boolean(), // isAnnual
        fc.option(fc.string(), { nil: null }), // error (shouldn't matter when loading)
        (loading, isAnnual, error) => {
          const showSkeleton = shouldShowPriceSkeleton(loading);
          const showValue = shouldShowPriceValue(loading, error);
          
          // When loading, skeleton should show and value should not
          expect(showSkeleton).toBe(true);
          expect(showValue).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not show skeleton when loading is false', () => {
    fc.assert(
      fc.property(
        fc.constant(false), // loading is always false
        fc.boolean(), // isAnnual
        fc.option(fc.string(), { nil: null }), // error
        (loading, isAnnual, error) => {
          const showSkeleton = shouldShowPriceSkeleton(loading);
          
          // When not loading, skeleton should not show
          expect(showSkeleton).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return loading state correctly from getPriceDisplayState', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // isAnnual
        fc.option(fc.string(), { nil: null }), // error
        (isAnnual, error) => {
          const config: PriceDisplayConfig = {
            loading: true,
            error,
            isAnnual,
          };
          
          // When loading is true, state should always be 'loading'
          const state = getPriceDisplayState(config);
          expect(state).toBe('loading');
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: pricing-page-improvements, Property 3: Price values replace skeleton when loaded**
 * **Validates: Requirements 3.3**
 * 
 * For any valid price data returned from the API, the price display should show 
 * the actual price value and the skeleton loader should not be present.
 */
describe('Property 3: Price values replace skeleton when loaded', () => {
  it('should show price value when not loading and no error', () => {
    fc.assert(
      fc.property(
        fc.constant(false), // loading is false
        fc.boolean(), // isAnnual
        fc.constant(null), // no error
        (loading, isAnnual, error) => {
          const showSkeleton = shouldShowPriceSkeleton(loading);
          const showValue = shouldShowPriceValue(loading, error);
          const showError = shouldShowPriceError(loading, error);
          
          // When loaded successfully, value should show, skeleton and error should not
          expect(showSkeleton).toBe(false);
          expect(showValue).toBe(true);
          expect(showError).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should show error indicator when not loading and error exists', () => {
    fc.assert(
      fc.property(
        fc.constant(false), // loading is false
        fc.boolean(), // isAnnual
        fc.string({ minLength: 1 }), // non-empty error string
        (loading, isAnnual, error) => {
          const showSkeleton = shouldShowPriceSkeleton(loading);
          const showValue = shouldShowPriceValue(loading, error);
          const showError = shouldShowPriceError(loading, error);
          
          // When error exists, error should show, skeleton and value should not
          expect(showSkeleton).toBe(false);
          expect(showValue).toBe(false);
          expect(showError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return correct state from getPriceDisplayState for all scenarios', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // loading
        fc.boolean(), // isAnnual
        fc.option(fc.string({ minLength: 1 }), { nil: null }), // error
        (loading, isAnnual, error) => {
          const config: PriceDisplayConfig = { loading, error, isAnnual };
          const state = getPriceDisplayState(config);
          
          if (loading) {
            expect(state).toBe('loading');
          } else if (error) {
            expect(state).toBe('error');
          } else {
            expect(state).toBe('loaded');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
