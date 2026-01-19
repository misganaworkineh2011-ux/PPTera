/**
 * Test fixtures for integration and edge case testing
 */

import type { OutlineSlide } from '../../types';

/**
 * Sample outline slides for integration testing
 */
export const sampleOutlineSlides: Record<string, OutlineSlide> = {
  // Title slide
  titleSlide: {
    type: 'title',
    title: 'Smart Layout Selection System',
    subtitle: 'Intelligent presentation design powered by AI',
  },

  // Features slide
  featuresSlide: {
    type: 'content',
    title: 'Key Features',
    bulletPoints: [
      'Real-time collaboration with team members',
      'Cloud storage integration for easy access',
      'Advanced analytics dashboard with insights',
      'Mobile app support for on-the-go editing',
    ],
    semanticIntent: 'inform',
    visualStrategy: {
      primary: 'text-focused',
      pattern: 'cards',
      emphasis: 'clarity',
    },
    contentLayoutHint: 'boxes',
  },

  // Process slide
  processSlide: {
    type: 'content',
    title: 'Implementation Process',
    bulletPoints: [
      'First, analyze the requirements and constraints',
      'Next, design the system architecture',
      'Then, implement core functionality',
      'After that, test thoroughly',
      'Finally, deploy to production',
    ],
    semanticIntent: 'instruct',
    visualStrategy: {
      primary: 'diagram',
      pattern: 'flow',
      emphasis: 'progression',
    },
    contentLayoutHint: 'sequence',
  },

  // Statistics slide
  statisticsSlide: {
    type: 'content',
    title: 'Performance Metrics',
    bulletPoints: [
      '99.9% uptime guarantee',
      '50ms average response time',
      '1M+ API calls per day',
      '95% customer satisfaction',
    ],
    semanticIntent: 'emphasize',
    visualStrategy: {
      primary: 'text-focused',
      pattern: 'spotlight',
      emphasis: 'scale',
    },
    contentLayoutHint: 'numbers',
  },

  // Timeline slide
  timelineSlide: {
    type: 'content',
    title: 'Product Roadmap',
    bulletPoints: [
      'Q1 2024: Launch beta version',
      'Q2 2024: Add premium features',
      'Q3 2024: Expand to new markets',
      'Q4 2024: Achieve profitability',
    ],
    semanticIntent: 'inform',
    visualStrategy: {
      primary: 'diagram',
      pattern: 'timeline',
      emphasis: 'progression',
    },
    contentLayoutHint: 'sequence',
  },

  // Comparison slide
  comparisonSlide: {
    type: 'content',
    title: 'Our Solution vs Competitors',
    bulletPoints: [
      'Our solution: Fast, reliable, affordable',
      'Competitor A: Slow, expensive, limited features',
      'Competitor B: Complex, hard to use, poor support',
    ],
    semanticIntent: 'compare',
    visualStrategy: {
      primary: 'mixed',
      pattern: 'split',
      emphasis: 'contrast',
    },
    contentLayoutHint: 'boxes',
  },

  // Testimonial slide
  testimonialSlide: {
    type: 'content',
    title: 'What Our Customers Say',
    bulletPoints: [
      '"This product changed how we work" - John Doe, CEO',
      '"Best investment we made this year" - Jane Smith, CTO',
      '"Incredible support and features" - Bob Johnson, Manager',
    ],
    semanticIntent: 'emphasize',
    visualStrategy: {
      primary: 'text-focused',
      pattern: 'cards',
      emphasis: 'clarity',
    },
    contentLayoutHint: 'quotes',
  },

  // How-to slide
  howToSlide: {
    type: 'content',
    title: 'Getting Started',
    bulletPoints: [
      'Step 1: Create your account',
      'Step 2: Set up your workspace',
      'Step 3: Invite team members',
      'Step 4: Start your first project',
    ],
    semanticIntent: 'instruct',
    visualStrategy: {
      primary: 'diagram',
      pattern: 'flow',
      emphasis: 'progression',
    },
    contentLayoutHint: 'steps',
  },

  // Image slide
  imageSlide: {
    type: 'content',
    title: 'Our Modern Office',
    bulletPoints: [
      'State-of-the-art facilities',
      'Collaborative workspaces',
      'Cutting-edge technology',
    ],
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
        pexelsPromptHint: 'modern office workspace',
        aiPromptHint: 'bright modern office with collaborative spaces',
      },
    },
  },

  // Categories slide
  categoriesSlide: {
    type: 'content',
    title: 'Product Tiers',
    bulletPoints: [
      'Basic: Essential features for individuals',
      'Pro: Advanced tools for teams',
      'Enterprise: Full suite for organizations',
    ],
    semanticIntent: 'inform',
    visualStrategy: {
      primary: 'text-focused',
      pattern: 'cards',
      emphasis: 'hierarchy',
    },
    contentLayoutHint: 'boxes',
  },

  // Cycle slide
  cycleSlide: {
    type: 'content',
    title: 'Continuous Improvement',
    bulletPoints: [
      'Plan: Define goals and strategies',
      'Do: Implement changes',
      'Check: Measure results',
      'Act: Refine and iterate',
    ],
    semanticIntent: 'inform',
    visualStrategy: {
      primary: 'diagram',
      pattern: 'flow',
      emphasis: 'relationship',
    },
    contentLayoutHint: 'circles',
  },

  // Edge case: Empty bullets
  emptySlide: {
    type: 'content',
    title: 'Empty Content',
    bulletPoints: [],
    semanticIntent: 'inform',
    visualStrategy: {
      primary: 'text-focused',
      pattern: 'cards',
      emphasis: 'clarity',
    },
  },

  // Edge case: Single bullet
  singleBulletSlide: {
    type: 'content',
    title: 'Single Point',
    bulletPoints: ['This is the only bullet point on this slide'],
    semanticIntent: 'emphasize',
    visualStrategy: {
      primary: 'text-focused',
      pattern: 'spotlight',
      emphasis: 'scale',
    },
  },

  // Edge case: Very long bullets
  longBulletsSlide: {
    type: 'content',
    title: 'Detailed Information',
    bulletPoints: [
      'This is an extremely long bullet point that contains a lot of detailed information about a complex topic that requires extensive explanation and goes on and on with multiple clauses and subclauses to fully convey the necessary details',
      'Another very long bullet point that provides comprehensive coverage of another important aspect of the subject matter with thorough explanations and examples',
    ],
    semanticIntent: 'inform',
    visualStrategy: {
      primary: 'text-focused',
      pattern: 'cards',
      emphasis: 'clarity',
    },
  },

  // Edge case: Many bullets
  manyBulletsSlide: {
    type: 'content',
    title: 'Comprehensive List',
    bulletPoints: [
      'Point 1',
      'Point 2',
      'Point 3',
      'Point 4',
      'Point 5',
      'Point 6',
      'Point 7',
      'Point 8',
      'Point 9',
      'Point 10',
      'Point 11',
      'Point 12',
      'Point 13',
      'Point 14',
      'Point 15',
    ],
    semanticIntent: 'inform',
    visualStrategy: {
      primary: 'text-focused',
      pattern: 'grid',
      emphasis: 'clarity',
    },
  },

  // Edge case: Missing metadata
  missingMetadataSlide: {
    type: 'content',
    title: 'No Metadata',
    bulletPoints: [
      'First point without metadata',
      'Second point without metadata',
      'Third point without metadata',
    ],
    // No semanticIntent, visualStrategy, or contentLayoutHint
  },

  // Edge case: Malformed metadata
  malformedMetadataSlide: {
    type: 'content',
    title: 'Malformed Metadata',
    bulletPoints: [
      'Point with bad metadata',
      'Another point',
    ],
    semanticIntent: 'invalid-intent' as any,
    visualStrategy: {
      primary: 'invalid-primary' as any,
      pattern: 'invalid-pattern' as any,
      emphasis: 'invalid-emphasis' as any,
    },
  },
};

/**
 * Sample presentation for integration testing (10 slides)
 */
export const samplePresentation: OutlineSlide[] = [
  sampleOutlineSlides.titleSlide,
  sampleOutlineSlides.featuresSlide,
  sampleOutlineSlides.processSlide,
  sampleOutlineSlides.statisticsSlide,
  sampleOutlineSlides.timelineSlide,
  sampleOutlineSlides.comparisonSlide,
  sampleOutlineSlides.testimonialSlide,
  sampleOutlineSlides.howToSlide,
  sampleOutlineSlides.imageSlide,
  sampleOutlineSlides.categoriesSlide,
];

/**
 * Large presentation for performance testing (20 slides)
 */
export const largePresentation: OutlineSlide[] = [
  sampleOutlineSlides.titleSlide,
  ...samplePresentation.slice(1),
  ...samplePresentation.slice(1),
  sampleOutlineSlides.cycleSlide,
];
