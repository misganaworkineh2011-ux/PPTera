# AI Layout Selection Guide

## Quick Reference for Content Layout Selection

This guide helps understand how the AI selects layouts based on content semantics.

## Layout Categories & Use Cases

### Standard Layouts (No Special Limits)

#### boxes
- **Use for:** Distinct concepts, features, benefits, categories
- **Max items:** 6
- **Word limit:** 15-25 words per item
- **Example topics:** Product features, service offerings, key benefits

#### bullets
- **Use for:** Traditional lists, supporting details, hierarchical content
- **Max items:** 6
- **Word limit:** 15-25 words per item
- **Example topics:** Key points, details, supporting information

#### sequence
- **Use for:** Sequential processes, timelines, chronological flows
- **Max items:** 6
- **Word limit:** 15-25 words per item
- **Example topics:** Historical timeline, project phases, event sequence

#### steps
- **Use for:** Step-by-step guides, tutorials, procedural instructions
- **Max items:** 6
- **Word limit:** 15-25 words per item
- **Example topics:** How-to guides, recipes, installation instructions

#### quotes
- **Use for:** Testimonials, quotes, statements, expert opinions
- **Max items:** 3-4
- **Word limit:** 20-40 words per quote
- **Example topics:** Customer testimonials, expert opinions, famous quotes

#### numbers
- **Use for:** Statistics, metrics, data points, numerical highlights
- **Max items:** 6
- **Word limit:** 15-25 words per item
- **Example topics:** Key metrics, statistics, performance numbers

### Circular Layouts (5 Items Max)

#### circles
- **Use for:** Interconnected concepts, cycles, circular relationships
- **Max items:** 5 (STRICT)
- **Label limit:** 5 words
- **Description limit:** 20 words
- **Example topics:** Business cycles, interconnected systems, continuous processes
- **Visual style:** Items arranged in circular pattern with connecting elements

### Workflow Layouts (4 Items Max)

#### cascading
- **Use for:** Staggered workflows with numbered items
- **Max items:** 4 (STRICT)
- **Label limit:** 5 words
- **Description limit:** 20 words
- **Example topics:** Project workflow, development stages, process steps
- **Visual style:** Staggered boxes with connecting lines and numbers

#### chevron
- **Use for:** Continuous flow steps with directional progression
- **Max items:** 4 (STRICT)
- **Label limit:** 5 words
- **Description limit:** 20 words
- **Example topics:** Sales funnel stages, customer journey, process flow
- **Visual style:** Horizontal chevron arrows with numbered steps

### Funnel Layout (6 Items Max)

#### funnel
- **Use for:** Conversion processes, narrowing stages, filtering steps
- **Max items:** 6 (STRICT)
- **Label limit:** 5 words
- **Description limit:** 15 words
- **Example topics:** Sales funnel, recruitment process, filtering stages
- **Visual style:** Progressively narrowing bars with side content

### Comparison Layouts (6 Per Side Max)

#### proscons
- **Use for:** Pros and cons analysis, advantages vs disadvantages
- **Max items:** 6 per side (12 total, STRICT)
- **Label limit:** 4 words (VERY SHORT!)
- **Description limit:** 4 words (VERY SHORT!)
- **Example topics:** Product comparison, decision analysis, trade-offs
- **Visual style:** Split circle with items on both sides
- **Note:** This layout requires VERY concise text - both labels AND descriptions must be 4 words max

#### comparison
- **Use for:** VS comparisons, side-by-side contrasts
- **Max items:** 6 per side (12 total, STRICT)
- **Label limit:** 4 words
- **Description limit:** 10 words
- **Example topics:** Product A vs Product B, old vs new, option comparison
- **Visual style:** Vertical split with items on both sides

#### beforeafter
- **Use for:** Before and after states, transformations, changes
- **Max items:** 6 per side (12 total, STRICT)
- **Label limit:** 6 words
- **Description limit:** Not used (labels only)
- **Example topics:** Transformation results, improvement showcase, change impact
- **Visual style:** Circular comparison with before/after sections

## AI Selection Strategy

### Content Analysis
The AI analyzes slide content to determine:
1. **Semantic intent:** What is the slide trying to communicate?
2. **Content structure:** How is the information organized?
3. **Item count:** How many points need to be displayed?
4. **Relationship type:** Are items sequential, comparative, cyclical, etc.?

### Selection Priority
1. **Match semantic intent** to layout purpose
2. **Respect item count limits** - never exceed maximum
3. **Consider word count constraints** - especially for comparison layouts
4. **Ensure variety** - use 3-4 different layouts per presentation

### Common Patterns

**For processes/workflows:**
- 2-4 steps → cascading or chevron
- 5+ steps → sequence or steps
- Cyclical process → circles

**For comparisons:**
- Pros vs cons → proscons
- A vs B comparison → comparison
- Before vs after → beforeafter

**For concepts:**
- Interconnected ideas → circles
- Independent features → boxes
- Hierarchical info → bullets

**For data:**
- Key metrics → numbers
- Statistics with context → boxes or bullets

## Critical Rules

1. **Never exceed max items** - If content has 7 items and layout max is 5, either:
   - Choose a different layout that supports more items
   - Consolidate items to fit within limit

2. **Respect word limits** - Especially critical for:
   - proscons: 4 words for BOTH label and description
   - comparison: 4 words for labels, 10 for descriptions
   - beforeafter: 6 words for labels, no descriptions

3. **Stop generating when limit reached** - Don't create extra items that won't display

4. **Match layout to content semantics** - Don't force content into inappropriate layouts

## Examples

### Good Layout Selection

**Topic:** "5 Key Benefits of Cloud Computing"
- **Layout:** circles (5 items, interconnected benefits)
- **Rationale:** 5 items fits circular layout, benefits are interconnected

**Topic:** "4-Step Sales Process"
- **Layout:** chevron (4 steps, sequential flow)
- **Rationale:** 4 items fits chevron, shows directional progression

**Topic:** "Remote Work: Pros and Cons"
- **Layout:** proscons (balanced comparison)
- **Rationale:** Natural pros/cons split, short concise points

### Poor Layout Selection

**Topic:** "8 Marketing Strategies" → circles ❌
- **Problem:** Circles max is 5 items, this has 8
- **Better:** boxes or bullets (supports 6+)

**Topic:** "Detailed Product Comparison" → proscons ❌
- **Problem:** Proscons requires 4-word descriptions, comparison needs detail
- **Better:** comparison (allows 10-word descriptions)

**Topic:** "Linear Timeline" → circles ❌
- **Problem:** Circles implies cyclical/interconnected, timeline is linear
- **Better:** sequence or steps

## Testing Your Layout Selection

Ask yourself:
1. Does the item count fit within the layout's maximum?
2. Can the content be expressed within the word limits?
3. Does the layout's visual metaphor match the content's structure?
4. Will users understand the relationship between items in this layout?

If any answer is "no", choose a different layout.
