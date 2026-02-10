# Content Generation Rules for Layouts

## Overview
This document defines strict rules for AI content generation to ensure optimal display across all layout types. These rules prevent content overflow and maintain visual quality.

## Layout-Specific Rules

### 1. Before & After Layout
**Layout ID**: `beforeafter-circle`
- **Max Points**: 6 per side (12 total)
- **Label Length**: Max 6 words
- **Description**: Not used in this layout
- **Important**: Stop generating after 6 points per side

**Example**:
```
✅ GOOD: "Manual Workflows" (2 words)
✅ GOOD: "High Operational Costs" (3 words)
❌ BAD: "Manual Workflows That Require Human Intervention" (6+ words)
```

### 2. Circular Layouts (All Types)
**Layout IDs**: `circle-*`, `circular-*`
- **Max Points**: 5 points total
- **Label Length**: Max 5 words
- **Description**: Max 20 words
- **Important**: Never generate more than 5 points

**Example**:
```
✅ GOOD Label: "Customer Engagement" (2 words)
✅ GOOD Description: "Build lasting relationships through personalized communication and responsive support" (10 words)
❌ BAD Description: "Build lasting relationships through personalized communication and responsive support that addresses customer needs in real-time with dedicated account managers" (21+ words)
```

### 3. VS Comparison Layout
**Layout ID**: `comparison-split`
- **Max Points**: 6 per side (12 total)
- **Label Length**: Max 4 words
- **Description**: Max 10 words
- **Important**: Stop at 6 points per side

**Example**:
```
✅ GOOD Label: "Offline Access" (2 words)
✅ GOOD Label: "Internet Required" (2 words)
✅ GOOD Description: "No internet connection needed" (4 words)
❌ BAD Label: "Accessible From Anywhere Globally" (4+ words)
```

### 4. Cascading Workflow Layout
**Layout ID**: `cascading-workflow`
- **Max Points**: 4 points total
- **Label Length**: Max 5 words
- **Description**: Max 20 words
- **Important**: Never exceed 4 points

**Example**:
```
✅ GOOD Label: "Data Collection" (2 words)
✅ GOOD Description: "Gather customer feedback through surveys and analytics platforms" (9 words)
❌ BAD: 5 or more points (will not display properly)
```

### 5. Chevron Flow Layout
**Layout ID**: `chevron-flow`
- **Max Points**: 4 points total
- **Label Length**: Max 5 words
- **Description**: Max 20 words
- **Important**: Stop at 4 points

**Example**:
```
✅ GOOD Label: "Research Phase" (2 words)
✅ GOOD Description: "Analyze market trends and competitor strategies" (6 words)
❌ BAD Description: "Conduct comprehensive market research including competitor analysis, customer surveys, trend forecasting, and industry reports" (15+ words)
```

### 6. Pros & Cons Layout
**Layout ID**: `proscons-split`
- **Max Points**: 6 per side (12 total)
- **Label Length**: Max 4 words
- **Description**: Max 4 words
- **Important**: Keep both label and description very short

**Example**:
```
✅ GOOD Label: "Scalable Growth" (2 words)
✅ GOOD Description: "Expands easily" (2 words)
❌ BAD Label: "Highly Scalable Business Growth" (4+ words)
❌ BAD Description: "Can expand operations quickly" (4+ words)
```

### 7. Funnel Steps Layout
**Layout ID**: `funnel-steps`
- **Max Points**: 6 points total
- **Label Length**: Max 5 words
- **Description**: Max 15 words
- **Important**: Never generate more than 6 steps

**Example**:
```
✅ GOOD Label: "Awareness Stage" (2 words)
✅ GOOD Description: "Attract potential customers through marketing campaigns" (6 words)
❌ BAD: 7 or more steps (will overflow)
```

## General Rules for All Layouts

### Word Count Guidelines
1. **Always count words accurately** - "High-quality" counts as 1 word (hyphenated)
2. **Include articles** - "The best solution" = 3 words
3. **Numbers count as words** - "24/7 support" = 2 words

### Content Quality
1. **Be concise** - Use impactful, clear language
2. **Avoid redundancy** - Don't repeat information
3. **Use active voice** - More engaging and shorter
4. **Remove filler words** - "very", "really", "actually"

### AI Generation Instructions

When generating content for these layouts, the AI should:

1. **Check layout type first** - Identify which layout is being used
2. **Apply strict limits** - Never exceed max points or word counts
3. **Prioritize quality over quantity** - Better to have 3 great points than 6 mediocre ones
4. **Stop at max** - Don't generate extra points "just in case"

## Implementation Notes

### For Developers
- Layout definitions already specify `maxItems` in their config
- Renderers slice arrays to display limits (e.g., `.slice(0, 6)`)
- However, **AI should not generate beyond limits** to avoid:
  - Wasted API calls
  - Confusion when content doesn't appear
  - Database bloat with unused content

### For AI Prompts
Include these instructions in AI generation prompts:

```
LAYOUT LIMITS (STRICT):
- beforeafter: Max 6 points per side, labels max 6 words
- circular: Max 5 points, descriptions max 20 words
- comparison: Max 6 per side, labels max 4 words
- cascading: Max 4 points, descriptions max 20 words
- chevron: Max 4 points, descriptions max 20 words
- proscons: Max 6 per side, labels AND descriptions max 4 words
- funnel: Max 6 points, descriptions max 15 words

NEVER generate more points than the maximum. Stop immediately when limit is reached.
```

## Validation Checklist

Before finalizing AI-generated content:

- [ ] Point count is within layout maximum
- [ ] All labels meet word count limits
- [ ] All descriptions meet word count limits
- [ ] Content is clear and impactful
- [ ] No redundant or filler content
- [ ] Each point adds unique value

## Examples by Layout

### Cascading Workflow (4 points max, 20 words desc)
```json
[
  {
    "label": "Discovery",
    "text": "Identify customer needs through research and stakeholder interviews"
  },
  {
    "label": "Planning",
    "text": "Create detailed roadmap with milestones and resource allocation"
  },
  {
    "label": "Execution",
    "text": "Implement solution with agile methodology and continuous testing"
  },
  {
    "label": "Review",
    "text": "Analyze results and gather feedback for improvement"
  }
]
```

### VS Comparison (6 per side, 4 word labels)
```json
[
  {
    "label": "Cloud Storage",
    "text": "Access anywhere",
    "side": "left"
  },
  {
    "label": "Local Storage", 
    "text": "Offline access",
    "side": "right"
  }
]
```

### Circular Layout (5 points, 20 word desc)
```json
[
  {
    "label": "Innovation",
    "text": "Drive breakthrough solutions through creative thinking and experimentation"
  },
  {
    "label": "Collaboration",
    "text": "Foster teamwork across departments to achieve common goals"
  },
  {
    "label": "Excellence",
    "text": "Maintain highest quality standards in all deliverables"
  },
  {
    "label": "Growth",
    "text": "Continuously improve skills and expand capabilities"
  },
  {
    "label": "Impact",
    "text": "Create meaningful change that benefits customers"
  }
]
```

## Summary Table

| Layout | Max Points | Label Max | Description Max |
|--------|-----------|-----------|-----------------|
| Before/After | 6 per side | 6 words | N/A |
| Circular | 5 total | 5 words | 20 words |
| VS Comparison | 6 per side | 4 words | 10 words |
| Cascading | 4 total | 5 words | 20 words |
| Chevron | 4 total | 5 words | 20 words |
| Pros/Cons | 6 per side | 4 words | 4 words |
| Funnel | 6 total | 5 words | 15 words |

## Status
**ACTIVE** - These rules must be enforced in all AI content generation for presentations.
