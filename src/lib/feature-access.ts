/**
 * Feature access control based on subscription plans
 * 
 * This file defines which features are available for each plan tier.
 * Based on the pricing page specifications.
 */

export type PlanTier = 'free' | 'plus' | 'pro' | 'ultra';

/**
 * Feature flags for each plan tier
 */
export const PLAN_FEATURES = {
  free: {
    // Basic features
    cardsPerPrompt: 10,
    monthlyCredits: 40, // Free credits (one-time signup)
    creditsReset: false, // Free users don't get monthly resets
    
    // Content creation
    basicPresentations: true,
    basicDocs: true,
    socialContent: true,
    basicImages: true,
    
    // Import/Export
    importPDF: true,
    importPPTX: true,
    exportPDF: true,
    exportPPTX: true,
    exportPNG: true,
    exportGoogleSlides: true,
    
    // Advanced features (locked)
    removeBranding: false,
    advancedAIModels: false,
    premiumAIModels: false,
    customBranding: false,
    customFonts: false,
    customThemes: false,
    analytics: false,
    advancedSharing: false,
    customDomains: 0,
    apiAccess: false,
    workspaceTemplates: false,
    advancedAIModelsAccess: false,
    earlyAccess: false,
  },
  
  plus: {
    // Basic features
    cardsPerPrompt: 20,
    monthlyCredits: 1000,
    creditsReset: true,
    
    // Content creation
    basicPresentations: true,
    basicDocs: true,
    socialContent: true,
    basicImages: true,
    
    // Import/Export
    importPDF: true,
    importPPTX: true,
    exportPDF: true,
    exportPPTX: true,
    exportPNG: true,
    exportGoogleSlides: true,
    
    // Plus features
    removeBranding: true,
    advancedAIModels: true,
    
    // Pro features (locked)
    premiumAIModels: false,
    customBranding: false,
    customFonts: false,
    customThemes: false,
    analytics: false,
    advancedSharing: false,
    customDomains: 0,
    apiAccess: false,
    workspaceTemplates: false,
    advancedAIModelsAccess: false,
    earlyAccess: false,
  },
  
  pro: {
    // Basic features
    cardsPerPrompt: 60,
    monthlyCredits: 4000,
    creditsReset: true,
    
    // Content creation
    basicPresentations: true,
    basicDocs: true,
    socialContent: true,
    basicImages: true,
    
    // Import/Export
    importPDF: true,
    importPPTX: true,
    exportPDF: true,
    exportPPTX: true,
    exportPNG: true,
    exportGoogleSlides: true,
    
    // Plus features
    removeBranding: true,
    advancedAIModels: true,
    
    // Pro features
    premiumAIModels: true,
    customBranding: true,
    customFonts: true,
    customThemes: true,
    analytics: true,
    advancedSharing: true,
    customDomains: 10,
    apiAccess: true,
    workspaceTemplates: true,
    
    // Ultra features (locked)
    advancedAIModelsAccess: false,
    earlyAccess: false,
  },
  
  ultra: {
    // Basic features
    cardsPerPrompt: 75,
    monthlyCredits: 20000,
    creditsReset: true,
    
    // Content creation
    basicPresentations: true,
    basicDocs: true,
    socialContent: true,
    basicImages: true,
    
    // Import/Export
    importPDF: true,
    importPPTX: true,
    exportPDF: true,
    exportPPTX: true,
    exportPNG: true,
    exportGoogleSlides: true,
    
    // Plus features
    removeBranding: true,
    advancedAIModels: true,
    
    // Pro features
    premiumAIModels: true,
    customBranding: true,
    customFonts: true,
    customThemes: true,
    analytics: true,
    advancedSharing: true,
    customDomains: 100,
    apiAccess: true,
    workspaceTemplates: true,
    
    // Ultra features
    advancedAIModelsAccess: true, // Access to most advanced AI models (text, image, video)
    earlyAccess: true,
  },
} as const;

/**
 * Get feature access for a specific plan
 */
export function getPlanFeatures(plan: string | null | undefined) {
  if (!plan) return PLAN_FEATURES.free;
  
  const planLower = plan.toLowerCase() as PlanTier;
  return PLAN_FEATURES[planLower] || PLAN_FEATURES.free;
}

/**
 * Check if a user has access to a specific feature
 */
export function hasFeatureAccess(
  plan: string | null | undefined,
  feature: keyof typeof PLAN_FEATURES.free
): boolean {
  const features = getPlanFeatures(plan);
  const value = features[feature];
  
  // Handle boolean features
  if (typeof value === 'boolean') return value;
  
  // Handle numeric features (treat > 0 as true)
  if (typeof value === 'number') return value > 0;
  
  return false;
}

/**
 * Get the minimum plan required for a feature
 */
export function getMinimumPlanForFeature(
  feature: keyof typeof PLAN_FEATURES.free
): PlanTier | null {
  const tiers: PlanTier[] = ['free', 'plus', 'pro', 'ultra'];
  
  for (const tier of tiers) {
    const features = PLAN_FEATURES[tier];
    const value = features[feature];
    
    if (typeof value === 'boolean' && value) return tier;
    if (typeof value === 'number' && value > 0) return tier;
  }
  
  return null;
}

/**
 * Get upgrade message for a locked feature
 */
export function getUpgradeMessage(feature: keyof typeof PLAN_FEATURES.free): string {
  const minPlan = getMinimumPlanForFeature(feature);
  
  if (!minPlan || minPlan === 'free') {
    return 'This feature is not available.';
  }
  
  const planName = minPlan.charAt(0).toUpperCase() + minPlan.slice(1);
  
  const featureNames: Record<string, string> = {
    removeBranding: 'Remove branding',
    advancedAIModels: 'Advanced AI image models',
    premiumAIModels: 'Premium AI image models',
    customBranding: 'Custom branding',
    customFonts: 'Custom fonts',
    customThemes: 'Custom themes',
    analytics: 'Analytics',
    advancedSharing: 'Advanced sharing',
    customDomains: 'Custom domains',
    apiAccess: 'API access',
    workspaceTemplates: 'Workspace templates',
    advancedAIModelsAccess: 'Most advanced AI models',
    earlyAccess: 'Early access to new features',
  };
  
  const featureName = featureNames[feature] || feature;
  
  return `${featureName} is only available for ${planName} ${minPlan === 'ultra' ? 'and above' : 'or higher'} plans. Upgrade to unlock this feature.`;
}

/**
 * Check if user can create more cards per prompt
 */
export function canCreateCards(
  plan: string | null | undefined,
  requestedCards: number
): { allowed: boolean; maxCards: number; message?: string } {
  const features = getPlanFeatures(plan);
  const maxCards = features.cardsPerPrompt;
  
  if (requestedCards <= maxCards) {
    return { allowed: true, maxCards };
  }
  
  const planName = plan || 'Free';
  return {
    allowed: false,
    maxCards,
    message: `${planName} plan allows up to ${maxCards} cards per prompt. You requested ${requestedCards} cards. Please upgrade to create more cards.`,
  };
}
