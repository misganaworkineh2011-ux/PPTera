/**
 * Database Query Caching Layer
 * Optimizes database access by caching frequently accessed data.
 */

import { serverCache, SERVER_CACHE_TTL, cachedQuery } from './server-cache';
import { db } from '~/server/db';

// Types
export interface PresentationListItem {
  id: string;
  title: string;
  isPublic: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  shareToken: string | null;
  thumbnailUrl: string | null;
  slideCount: number;
}

interface PresentationQueryOptions {
  limit?: number;
  offset?: number;
}

// Cache TTL Constants
const CACHE_TTL = {
  USER: SERVER_CACHE_TTL.STATIC,
  PRESENTATIONS: 2 * 60 * 1000,
  PRESENTATION_COUNT: 5 * 60 * 1000,
  PRESENTATION_DETAIL: 5 * 60 * 1000,
  THEMES: SERVER_CACHE_TTL.THEMES,
  ACTIVITY: 60 * 1000,
} as const;

// User Queries
export async function getCachedUser(userId: string) {
  return cachedQuery(
    `user:${userId}`,
    CACHE_TTL.USER,
    () => db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        credits: true,
        subscriptionPlan: true,
        image: true,
        createdAt: true,
        clerkId: true,
      }
    })
  );
}


// Presentation Queries
export async function getCachedPresentations(
  userId: string,
  options: PresentationQueryOptions = {}
): Promise<PresentationListItem[]> {
  const { limit = 12, offset = 0 } = options;
  const key = `presentations:${userId}:${limit}:${offset}`;

  return cachedQuery(key, CACHE_TTL.PRESENTATIONS, async () => {
    return db.$queryRaw<PresentationListItem[]>`
      SELECT 
        id,
        title,
        "isPublic",
        "isPinned",
        "createdAt",
        "updatedAt",
        "shareToken",
        "thumbnailUrl",
        COALESCE(jsonb_array_length(slides), 0)::int as "slideCount"
      FROM presentation
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
  });
}

export async function getCachedPresentationCount(userId: string): Promise<number> {
  return cachedQuery(
    `presentation-count:${userId}`,
    CACHE_TTL.PRESENTATION_COUNT,
    () => db.presentation.count({ where: { userId } })
  );
}

export async function getCachedPresentation(presentationId: string) {
  return cachedQuery(
    `presentation:${presentationId}`,
    CACHE_TTL.PRESENTATION_DETAIL,
    () => db.presentation.findUnique({
      where: { id: presentationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })
  );
}


// Theme Queries
export async function getCachedThemes(userId: string) {
  return cachedQuery(
    `themes:${userId}`,
    CACHE_TTL.THEMES,
    () => db.theme.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        name: true,
        colors: true,
        fonts: true,
        designElements: true,
        isDefault: true,
      }
    })
  );
}

// Activity Queries
export async function getCachedActivity(userId: string, limit = 10) {
  return cachedQuery(
    `activity:${userId}:${limit}`,
    CACHE_TTL.ACTIVITY,
    () => db.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        type: true,
        description: true,
        createdAt: true,
        presentation: {
          select: { id: true, title: true }
        }
      }
    })
  );
}

// Cache Invalidation
export function invalidateUserCache(userId: string): void {
  serverCache.invalidate(`user:${userId}`);
  serverCache.invalidatePattern(`^presentations:${userId}:`);
  serverCache.invalidatePattern(`^activity:${userId}:`);
  serverCache.invalidate(`presentation-count:${userId}`);
}

export function invalidateThemeCache(userId: string): void {
  serverCache.invalidate(`themes:${userId}`);
}

export function invalidatePresentationCache(presentationId: string, userId?: string): void {
  serverCache.invalidate(`presentation:${presentationId}`);
  if (userId) {
    serverCache.invalidatePattern(`^presentations:${userId}:`);
    serverCache.invalidate(`presentation-count:${userId}`);
  }
}
