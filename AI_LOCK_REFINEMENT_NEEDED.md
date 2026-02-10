# AI Lock Refinement - Implementation Guide

## Required Changes

### 1. Agent Panel (Edit All Cards)
**File**: `src/app/presentation/[slug]/components/AgentPanel.tsx`

**Current**: Shows locked state UI for free users (lines 450-520)
**Needed**: Remove the locked state `if (isFreeUser)` block, show the panel normally but:
- Add lock indicator in header subtitle: `{isFreeUser && <p className="text-xs flex items-center gap-1"><Lock size={12} />Upgrade to unlock</p>}`
- Disable send button for free users: `disabled={!prompt.trim() || isLoading || isFreeUser}`
- Disable quick action buttons: `disabled={isLoading || isFreeUser}`
- Add onClick to send button when disabled and free: `onClick={() => isFreeUser ? setShowUpgradeModal(true) : handleSubmitStreaming()}`

### 2. Slide Menu (Edit with AI)
**File**: `src/app/presentation/[slug]/components/SlideMenu.tsx`

**Current**: Button doesn't open panel for free users (line ~700)
**Needed**: Change button behavior:
- Remove the early return that prevents opening
- Let the panel open normally
- In AIPanel component, disable the send button for free users
- Add lock indicator and upgrade prompt in the panel

**AIPanel Changes** (around line 400):
- Add `isFreeUser` prop to AIPanel interface
- Pass `isFreeUser` from SlideMenu to AIPanel
- Disable send button: `disabled={isLoading || !prompt.trim() || isFreeUser}`
- Add onClick handler: `onClick={() => isFreeUser ? onUpgrade?.() : handleSubmit()}`
- Add lock message above textarea for free users

### 3. Add Slide Buttons (+AI)
**File**: `src/app/presentation/[slug]/components/AddSlideButtons.tsx`

**Current**: Button opens upgrade modal for free users (line ~140)
**Needed**: Change to open the AI panel but lock the send button:
- Remove the early return in onClick
- Let `showAIPanel` open normally
- In the AI panel, disable send button for free users
- Add lock indicator in panel header

**Panel Changes** (around line 200):
- Add lock indicator if free user
- Disable send button: `disabled={!prompt.trim() || isLoading || isFreeUser}`
- Add onClick to trigger upgrade modal when disabled

### 4. Hide Locked Slides in Present Mode
**File**: `src/app/presentation/[slug]/components/ScrollableSlidesView.tsx`

**Current**: Hides slides in scroll view
**Needed**: Also check for present mode and hide locked slides

**File**: `src/app/presentation/[slug]/components/PresentationContentArea.tsx` or wherever slides view mode is rendered

Add prop `isPresenting` to ScrollableSlidesView and use it:
```typescript
// In slide rendering logic
if (isHidden && !isPresenting) {
  return null; // Hide in normal view
}

// In present mode, also hide locked slides
if (isPresenting && isHidden) {
  return null;
}
```

## Summary of UX Changes

### Before (Current):
- Free users click AI features → See "locked" message → Must upgrade
- Locked slides hidden in scroll view but might show in present mode

### After (Needed):
- Free users click AI features → Panel/modal opens → Can type but send button is locked → Click send → Upgrade modal
- Locked slides hidden in both scroll view AND present mode
- All AI panels show but with disabled send buttons and lock indicators

## Implementation Priority
1. Hide locked slides in present mode (CRITICAL for demo)
2. Agent Panel - show but lock send button
3. Slide Menu AI Panel - show but lock send button  
4. Add Slide AI Panel - show but lock send button

## Key Principle
**Show the feature, lock the action** - Let users see what they're missing, but require upgrade to actually use it.
