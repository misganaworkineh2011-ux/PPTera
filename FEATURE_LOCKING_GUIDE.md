# Feature Locking & Upgrade Modal Guide

This guide explains how to implement feature locking based on subscription plans and show upgrade prompts using the custom modal.

## Overview

The feature locking system consists of:
1. **Feature Access Control** (`src/lib/feature-access.ts`) - Defines which features are available per plan
2. **Upgrade Modal** (`src/components/dashboard/UpgradeModal.tsx`) - Beautiful modal for upgrade prompts
3. **useUpgradeModal Hook** (`src/hooks/useUpgradeModal.tsx`) - Easy-to-use React hook

## Plan Tiers & Features

### Free Plan
- 10 cards per prompt
- 200 credits (one-time at signup)
- Basic presentations, docs, social content
- Import/Export: PDF, PPTX, PNG, Google Slides

### Plus Plan ($8/mo yearly, $10/mo monthly)
- 20 cards per prompt
- 1,000 monthly credits
- Remove branding
- Advanced AI image models

### Pro Plan ($18/mo yearly, $25/mo monthly)
- 60 cards per prompt
- 4,000 monthly credits
- Premium AI image models
- **Custom themes & branding** ✨
- **Custom fonts** ✨
- **Analytics** ✨
- **Advanced sharing** ✨
- **10 custom domains** ✨
- **API access** ✨
- **Workspace templates** ✨

### Ultra Plan ($90/mo yearly, $100/mo monthly)
- 75 cards per prompt
- 20,000 monthly credits
- **Most advanced AI models (text, image, video)** ✨
- **100 custom domains** ✨
- **Early access to new features** ✨

## Usage Examples

### Example 1: Using the Hook (Recommended)

```tsx
"use client";

import { useUpgradeModal } from "~/hooks/useUpgradeModal";
import { useDashboard } from "~/contexts/DashboardContext";
import { hasFeatureAccess } from "~/lib/feature-access";

export default function MyComponent() {
  const { user } = useDashboard();
  const { showUpgradeModal, UpgradeModal } = useUpgradeModal();

  const handlePremiumFeature = () => {
    // Check if user has access
    if (!hasFeatureAccess(user?.subscriptionPlan, 'customThemes')) {
      showUpgradeModal({
        feature: "Custom Themes & Branding",
        requiredPlan: "pro",
        currentPlan: user?.subscriptionPlan,
        description: "Create custom themes with your own colors, fonts, and branding.",
      });
      return;
    }

    // User has access, proceed with feature
    openThemeCreator();
  };

  return (
    <div>
      <button onClick={handlePremiumFeature}>
        Create Custom Theme
      </button>
      
      {/* Render the modal */}
      <UpgradeModal />
    </div>
  );
}
```

### Example 2: Direct Component Usage

```tsx
"use client";

import { useState } from "react";
import UpgradeModal from "~/components/dashboard/UpgradeModal";
import { useDashboard } from "~/contexts/DashboardContext";

export default function AnalyticsPage() {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { user } = useDashboard();
  const userPlan = user?.subscriptionPlan?.toLowerCase();

  // Check if user has Pro or Ultra
  const hasAnalytics = ['pro', 'ultra'].includes(userPlan || '');

  if (!hasAnalytics) {
    return (
      <div>
        <button onClick={() => setShowUpgrade(true)}>
          View Analytics
        </button>
        
        <UpgradeModal
          isOpen={showUpgrade}
          onClose={() => setShowUpgrade(false)}
          feature="Detailed Analytics"
          requiredPlan="pro"
          currentPlan={user?.subscriptionPlan}
          description="Track views, engagement, and performance metrics for your presentations."
        />
      </div>
    );
  }

  return <div>Analytics Dashboard...</div>;
}
```

### Example 3: Using Feature Access Utilities

```tsx
import { 
  hasFeatureAccess, 
  getPlanFeatures,
  getMinimumPlanForFeature,
  getUpgradeMessage,
  canCreateCards
} from "~/lib/feature-access";

// Check if user has a specific feature
const canUseAPI = hasFeatureAccess(userPlan, 'apiAccess');

// Get all features for a plan
const proFeatures = getPlanFeatures('pro');
console.log(proFeatures.customDomains); // 10

// Find minimum plan for a feature
const minPlan = getMinimumPlanForFeature('customThemes'); // 'pro'

// Get upgrade message
const message = getUpgradeMessage('analytics');
// "Analytics is only available for Pro or higher plans. Upgrade to unlock this feature."

// Check cards per prompt limit
const result = canCreateCards('plus', 30);
if (!result.allowed) {
  console.log(result.message);
  // "Plus plan allows up to 20 cards per prompt. You requested 30 cards. Please upgrade to create more cards."
}
```

## Backend Feature Locking

Always validate on the backend too! Example from `src/app/api/themes/route.ts`:

```typescript
import { hasFeatureAccess } from "~/lib/feature-access";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  
  // Check if user has Pro or Ultra plan
  if (!hasFeatureAccess(user.subscriptionPlan, 'customThemes')) {
    return NextResponse.json(
      { error: "Custom themes are only available for Pro and Ultra plans" },
      { status: 403 }
    );
  }

  // Proceed with theme creation...
}
```

## Styling the Upgrade Modal

The modal uses:
- Gradient backgrounds based on plan tier
- Smooth animations (fade-in, zoom-in)
- Dark mode support
- Responsive design
- Backdrop blur effect

## Best Practices

1. **Always check on backend** - Never trust client-side checks alone
2. **Use descriptive feature names** - "Custom Themes & Branding" not "themes"
3. **Provide context** - Explain what the feature does in the description
4. **Show current plan** - Help users understand their upgrade path
5. **Use the hook** - Cleaner code and easier to maintain

## Common Features to Lock

- `customThemes` - Pro+
- `customFonts` - Pro+
- `customBranding` - Pro+
- `analytics` - Pro+
- `advancedSharing` - Pro+
- `apiAccess` - Pro+
- `workspaceTemplates` - Pro+
- `advancedAIModelsAccess` - Ultra only
- `earlyAccess` - Ultra only

## Testing

Test with different plan values:
- `null` or `undefined` - Free user
- `'plus'` - Plus subscriber
- `'pro'` - Pro subscriber
- `'ultra'` - Ultra subscriber

```tsx
// Mock user for testing
const mockUser = {
  subscriptionPlan: 'plus', // Change this to test different plans
};
```
