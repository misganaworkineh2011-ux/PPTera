/**
 * Test utilities and helpers for smart layout selection tests
 */

import * as fc from 'fast-check';
import type {
  SlideMetadata,
  ContentAnalysis,
  LayoutScoringInput,
  LayoutSelectionContext,
  ContentLayoutCategory,
  BulletPattern,
  ContentType,
  SemanticMarkers,
} from '../types';

// ============================================================================
// Arbitraries for Property-Based Testing
// ============================================================================

/**
 * Generate arbitrary semantic intent values
 */
export const arbitrarySemanticIntent = () =>
  fc.constantFrom('inform', 'compare', 'instruct', 'emphasize', 'narrate', 'analyze', 'demonstrate');

/**
 * Generate arbitrary visual strategy
 */
export const arbitraryVisualStrategy = () =>
  fc.record({
    primary: fc.constantFrom('diagram', 'image', 'mixed', 'text-focused'),
    pattern: fc.constantFrom('cards', 'grid', 'flow', 'split', 'spotlight', 'pyramid', 'timeline'),
    emphasis: fc.constantFrom('progression', 'contrast', 'relationship', 'scale', 'hierarchy', 'clarity'),
  });

/**
 * Generate arbitrary content layout category
 */
export const arbitraryContentLayoutCategory = (): fc.Arbitrary<ContentLayoutCategory> =>
  fc.constantFrom('boxes', 'bullets', 'sequence', 'steps', 'quotes', 'circles', 'numbers', 'images');

/**
 * Generate arbitrary bullet pattern
 */
export const arbitraryBulletPattern = (): fc.Arbitrary<BulletPattern> =>
  fc.constantFrom(
    'numbered-steps',
    'quoted-text',
    'numeric',
    'sequential',
    'instructional',
    'distinct-concepts',
    'comparison',
    'categorical',
    'simple-list'
  );

/**
 * Generate arbitrary content type
 */
export const arbitraryContentType = (): fc.Arbitrary<ContentType> =>
  fc.constantFrom(
    'TIMELINE',
    'PROCESS',
    'FEATURES',
    'STATISTICS',
    'HOW_TO',
    'COMPARISON',
    'TESTIMONIAL',
    'CATEGORIES',
    'STEPS',
    'CYCLE',
    'GENERIC'
  );

/**
 * Generate arbitrary semantic markers
 */
export const arbitrarySemanticMarkers = (): fc.Arbitrary<SemanticMarkers> =>
  fc.record({
    timeline: fc.boolean(),
    process: fc.boolean(),
    statistics: fc.boolean(),
    quotes: fc.boolean(),
    comparison: fc.boolean(),
    instructions: fc.boolean(),
    categories: fc.boolean(),
    features: fc.boolean(),
    steps: fc.boolean(),
    cycle: fc.boolean(),
  });

/**
 * Generate arbitrary bullet points (1-20 bullets, 5-100 words each)
 */
export const arbitraryBulletPoints = () =>
  fc.array(
    fc.string({ minLength: 10, maxLength: 500 }),
    { minLength: 1, maxLength: 20 }
  );

/**
 * Generate arbitrary slide metadata
 */
export const arbitrarySlideMetadata = (): fc.Arbitrary<SlideMetadata> =>
  fc.record({
    semanticIntent: arbitrarySemanticIntent(),
    visualStrategy: arbitraryVisualStrategy(),
    contentLayoutHint: fc.option(arbitraryContentLayoutCategory(), { nil: undefined }),
    assets: fc.record({
      image: fc.option(
        fc.record({
          required: fc.boolean(),
          orientation: fc.constantFrom('landscape', 'portrait'),
          pexelsPromptHint: fc.string(),
          aiPromptHint: fc.string(),
        }),
        { nil: undefined }
      ),
    }),
  });

/**
 * Generate arbitrary content analysis
 */
export const arbitraryContentAnalysis = (): fc.Arbitrary<ContentAnalysis> =>
  fc.record({
    pattern: arbitraryBulletPattern(),
    semanticMarkers: arbitrarySemanticMarkers(),
    contentType: arbitraryContentType(),
    contentTypeConfidence: fc.integer({ min: 0, max: 100 }),
    bulletCount: fc.integer({ min: 1, max: 20 }),
    avgBulletLength: fc.integer({ min: 5, max: 100 }),
    maxBulletLength: fc.integer({ min: 10, max: 200 }),
    totalWordCount: fc.integer({ min: 10, max: 500 }),
    hasSequence: fc.boolean(),
    hasDistinctConcepts: fc.boolean(),
    hasHierarchy: fc.boolean(),
  });

/**
 * Generate arbitrary layout selection context
 */
export const arbitraryLayoutSelectionContext = (): fc.Arbitrary<LayoutSelectionContext> =>
  fc.record({
    slideIndex: fc.integer({ min: 0, max: 50 }),
    totalSlides: fc.integer({ min: 1, max: 100 }),
    previousLayouts: fc.array(
      fc.record({
        slideIndex: fc.integer({ min: 0, max: 50 }),
        category: arbitraryContentLayoutCategory(),
        style: fc.string(),
      }),
      { maxLength: 10 }
    ),
    presentationTone: fc.string(),
    presentationLanguage: fc.string(),
    themeStyle: fc.constantFrom('minimal', 'professional', 'creative'),
    categoryUsage: fc.constant(new Map()),
    styleUsage: fc.constant(new Map()),
  });

// ============================================================================
// Test Fixtures
// ============================================================================

/**
 * Sample bullet points for testing
 */
export const sampleBulletPoints = {
  numbered: [
    '1. First step in the process',
    '2. Second step to follow',
    '3. Third and final step',
  ],
  quoted: [
    '"This is an amazing product" - John Doe',
    '"Highly recommend to everyone" - Jane Smith',
    '"Changed my life completely" - Bob Johnson',
  ],
  numeric: [
    '95% customer satisfaction rate',
    '$2.5M in annual revenue',
    '10,000+ active users worldwide',
  ],
  sequential: [
    'First, gather all requirements',
    'Next, design the solution',
    'Then, implement the features',
    'Finally, test and deploy',
  ],
  instructional: [
    'Click the button to start',
    'Enter your email address',
    'Verify your account',
    'Complete the setup process',
  ],
  distinctConcepts: [
    'Innovation drives our product development',
    'Quality ensures customer satisfaction',
    'Speed delivers competitive advantage',
  ],
  comparison: [
    'Our solution vs competitors',
    'Before and after results',
    'Traditional vs modern approach',
  ],
  categorical: [
    'Category A: Basic features',
    'Category B: Advanced tools',
    'Category C: Enterprise solutions',
  ],
  simple: [
    'Easy to use interface',
    'Fast performance',
    'Reliable support',
    'Affordable pricing',
  ],
  timeline: [
    'Q1 2024: Launch beta version',
    'Q2 2024: Add premium features',
    'Q3 2024: Expand to new markets',
    'Q4 2024: Achieve profitability',
  ],
  features: [
    'Real-time collaboration',
    'Cloud storage integration',
    'Advanced analytics dashboard',
    'Mobile app support',
  ],
  statistics: [
    '99.9% uptime guarantee',
    '50ms average response time',
    '1M+ API calls per day',
  ],
  howTo: [
    'Open the application',
    'Navigate to settings',
    'Configure your preferences',
    'Save and apply changes',
  ],
  empty: [],
  single: ['Only one bullet point here'],
  veryLong: [
    'This is an extremely long bullet point that contains a lot of text and goes on and on with detailed explanations about various topics and concepts that need to be covered in this particular slide and it just keeps going with more and more information',
  ],
};

/**
 * Sample slide metadata for testing
 */
export const sampleMetadata: Record<string, SlideMetadata> = {
  inform: {
    semanticIntent: 'inform',
    visualStrategy: {
      primary: 'text-focused',
      pattern: 'cards',
      emphasis: 'clarity',
    },
    contentLayoutHint: 'boxes',
    assets: {},
  },
  compare: {
    semanticIntent: 'compare',
    visualStrategy: {
      primary: 'mixed',
      pattern: 'split',
      emphasis: 'contrast',
    },
    contentLayoutHint: 'boxes',
    assets: {},
  },
  instruct: {
    semanticIntent: 'instruct',
    visualStrategy: {
      primary: 'diagram',
      pattern: 'flow',
      emphasis: 'progression',
    },
    contentLayoutHint: 'steps',
    assets: {},
  },
  emphasize: {
    semanticIntent: 'emphasize',
    visualStrategy: {
      primary: 'text-focused',
      pattern: 'spotlight',
      emphasis: 'scale',
    },
    contentLayoutHint: 'circles',
    assets: {},
  },
  withImage: {
    semanticIntent: 'inform',
    visualStrategy: {
      primary: 'image',
      pattern: 'split',
      emphasis: 'clarity',
    },
    contentLayoutHint: 'images',
    assets: {
      image: {
        required: true,
        orientation: 'landscape',
        pexelsPromptHint: 'business meeting',
        aiPromptHint: 'professional office setting',
      },
    },
  },
};

/**
 * Sample content analysis for testing
 */
export const sampleAnalysis: Record<string, ContentAnalysis> = {
  features: {
    pattern: 'distinct-concepts',
    semanticMarkers: {
      timeline: false,
      process: false,
      statistics: false,
      quotes: false,
      comparison: false,
      instructions: false,
      categories: false,
      features: true,
      steps: false,
      cycle: false,
    },
    contentType: 'FEATURES',
    contentTypeConfidence: 85,
    bulletCount: 4,
    avgBulletLength: 25,
    maxBulletLength: 35,
    totalWordCount: 100,
    hasSequence: false,
    hasDistinctConcepts: true,
    hasHierarchy: false,
  },
  process: {
    pattern: 'sequential',
    semanticMarkers: {
      timeline: false,
      process: true,
      statistics: false,
      quotes: false,
      comparison: false,
      instructions: false,
      categories: false,
      features: false,
      steps: true,
      cycle: false,
    },
    contentType: 'PROCESS',
    contentTypeConfidence: 90,
    bulletCount: 5,
    avgBulletLength: 30,
    maxBulletLength: 40,
    totalWordCount: 150,
    hasSequence: true,
    hasDistinctConcepts: false,
    hasHierarchy: false,
  },
  statistics: {
    pattern: 'numeric',
    semanticMarkers: {
      timeline: false,
      process: false,
      statistics: true,
      quotes: false,
      comparison: false,
      instructions: false,
      categories: false,
      features: false,
      steps: false,
      cycle: false,
    },
    contentType: 'STATISTICS',
    contentTypeConfidence: 95,
    bulletCount: 3,
    avgBulletLength: 20,
    maxBulletLength: 25,
    totalWordCount: 60,
    hasSequence: false,
    hasDistinctConcepts: true,
    hasHierarchy: false,
  },
};

/**
 * Create a basic layout selection context for testing
 */
export function createTestContext(overrides?: Partial<LayoutSelectionContext>): LayoutSelectionContext {
  return {
    slideIndex: 0,
    totalSlides: 10,
    previousLayouts: [],
    presentationTone: 'professional',
    presentationLanguage: 'en',
    themeStyle: 'professional',
    categoryUsage: new Map(),
    styleUsage: new Map(),
    ...overrides,
  };
}

/**
 * Helper to count words in text
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

/**
 * Helper to calculate average length
 */
export function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}
