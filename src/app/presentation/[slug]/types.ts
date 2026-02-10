import type { PresentationData } from "~/components/presentation/types";

export interface CustomThemeData {
  id: string;
  name: string;
  colors: unknown;
  fonts?: unknown;
  designElements?: unknown;
}

export interface PresentationViewerProps {
  presentation: PresentationData;
  mode: string;
  isOwner: boolean;
  collaboratorRole?: string;
  isPublicView?: boolean;
  /** OPTIMIZATION: Prefetched custom theme from SSR to avoid client-side fetch */
  prefetchedCustomTheme?: CustomThemeData | null;
  /** Enable streaming mode - content will be streamed from server */
  isStreaming?: boolean;
  /** Total slides expected when streaming */
  totalSlidesForStreaming?: number;
  /** User's subscription plan for model access */
  subscriptionPlan?: string | null;
  /** Show upgrade modal on load (for free users with limited slides) */
  shouldShowUpgradeModal?: boolean;
  /** Free user limitation flag */
  isFreeUserLimited?: boolean;
  /** Number of fully visible slides for free users */
  freeSlideLimit?: number;
  /** Index of the half-blurred slide for free users */
  halfBlurredSlideIndex?: number;
}
