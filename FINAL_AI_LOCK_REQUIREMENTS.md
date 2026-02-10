# Final AI Lock Requirements - Summary

## User Request
"Show the modal/panel but lock the send button, not the whole panel. Apply to all 3 AI features. Also hide locked slides in present mode."

## Current State vs Required State

### 1. Agent Panel (Navbar "AI Agent" button)
**Current**: Shows locked UI with upgrade message for free users
**Required**: 
- Show the full panel with textarea and quick actions
- Add small lock indicator in header: "🔒 Upgrade to unlock"
- Disable send button and quick action buttons
- When clicking disabled send button → show upgrade modal

### 2. Slide Menu "Edit with AI" button  
**Current**: Button shows lock icon, doesn't open panel
**Required**:
- Button opens the AI panel normally
- Panel shows with textarea
- Send button is disabled with lock icon
- Clicking disabled send → upgrade modal

### 3. Add Slide "+AI" button (between slides)
**Current**: Opens upgrade modal directly
**Required**:
- Opens AI panel with prompt input
- Send button disabled with lock icon  
- Clicking disabled send → upgrade modal

### 4. Present Mode - Hide Locked Slides
**Current**: Locked slides might be accessible in present mode
**Required**:
- In present mode (fullscreen/presenting), skip locked slides entirely
- Navigation (arrow keys, next/prev) should jump over locked slides
- Only show slides 0 to `halfBlurredSlideIndex` (inclusive)

## Implementation Approach

### For AI Panels (1, 2, 3):
```typescript
// Instead of:
if (isFreeUser) {
  return <LockedStateUI />;
}

// Do this:
return (
  <Panel>
    <Header>
      {isFreeUser && <LockBadge />}
    </Header>
    <Textarea disabled={isFreeUser} />
    <SendButton 
      disabled={isFreeUser || !prompt}
      onClick={() => isFreeUser ? showUpgrade() : send()}
    />
    <QuickActions disabled={isFreeUser} />
  </Panel>
);
```

### For Present Mode Slide Filtering:
```typescript
// In navigation logic (nextSlide/prevSlide/goToSlide):
const getValidSlideIndex = (index: number) => {
  if (!isFreeUserLimited) return index;
  if (halfBlurredSlideIndex === undefined) return index;
  
  // Clamp to valid range
  return Math.min(index, halfBlurredSlideIndex);
};

// When navigating:
const nextSlide = () => {
  const next = currentSlide + 1;
  const validNext = getValidSlideIndex(next);
  if (validNext === currentSlide) {
    // At the end of free slides
    if (isFreeUserLimited) showUpgradeModal();
    return;
  }
  setCurrentSlide(validNext);
};
```

## Files to Modify

1. **src/app/presentation/[slug]/components/AgentPanel.tsx**
   - Remove locked state UI block (lines ~450-520)
   - Add lock badge in header
   - Disable buttons with `isFreeUser` check
   - Add upgrade modal trigger on disabled send click

2. **src/app/presentation/[slug]/components/SlideMenu.tsx**
   - Remove early return in AI button onClick
   - Pass `isFreeUser` to AIPanel component
   - In AIPanel: disable send, add lock badge

3. **src/app/presentation/[slug]/components/AddSlideButtons.tsx**
   - Remove early return in +AI button onClick
   - Let panel open normally
   - Disable send button for free users
   - Add lock badge in panel

4. **src/app/presentation/[slug]/hooks/useSlideNavigation.ts** (or wherever navigation is)
   - Add slide clamping logic for free users
   - Prevent navigation beyond `halfBlurredSlideIndex`
   - Show upgrade modal when trying to go past limit

5. **src/app/presentation/[slug]/PresentationViewer.tsx**
   - Pass lock metadata to navigation hooks
   - Ensure present mode respects slide limits

## Testing Checklist
- [ ] Free user opens Agent Panel → sees panel with disabled send button
- [ ] Free user opens Slide Menu AI → sees panel with disabled send button  
- [ ] Free user opens +AI panel → sees panel with disabled send button
- [ ] Clicking any disabled send button → upgrade modal appears
- [ ] In present mode, arrow keys don't go past locked slides
- [ ] In present mode, locked slides are not accessible
- [ ] Paid user has full access to all features

## Priority
1. **CRITICAL**: Hide locked slides in present mode
2. **HIGH**: Show panels but lock send buttons (better UX)

## Status
📋 **DOCUMENTED** - Ready for implementation
