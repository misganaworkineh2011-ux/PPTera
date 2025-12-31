/**
 * Database query caching layer
 * Reduces database CU hours by caching frequently accessed data
 */

import { serverCache, SERVER_CACHE_TTL, cachedQuery } from './server-cache';
import { db } from '~/server/db';
import type { Prisma } from '@prisma/client';

/**
 * Get user with caching
 */
export async function getCachedUser(userId: string) {
  return cachedQuery(
    `user:${userId}`,
    SERVER_CACHE_TTL.STATIC,
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

/**
 * Get user presentations with caching and pagination
 */
export async function getCachedPresentations(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    includeSlides?: boolean;
  } = {}
) {
  const { limit = 12, offset = 0, includeSlides = false } = options;
  const key = `presentations:${userId}:${limit}:${offset}:${includeSlides}`;
  
  return cachedQuery(
    key,
    2 * 60 * 1000, // 2 minutes - presentations change frequently
    () => db.presentation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        title: true,
        isPublic: true,
        isPinned: true,
        createdAt: true,
        updatedAt: true,
        shareToken: true,
        slides: includeSlides,
        _count: includeSlides ? undefined : {
          select: { slides: true }
        }
      }
    })
  );
}

/**
 * Get user themes with caching
 */
export async function getCachedThemes(userId: string) {
  return cachedQuery(
    `themes:${userId}`,
    SERVER_CACHE_TTL.THEMES,
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

/**
 * Get recent activity with caching
 */
export async function getCachedActivity(userId: string, limit = 10) {
  return cachedQuery(
    `activity:${userId}:${limit}`,
    60 * 1000, // 1 minute - activity changes frequently
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

/**
 * Get presentation count with caching
 */
export async function getCachedPresentationCount(userId: string) {
  return cachedQuery(
    `presentation-count:${userId}`,
    5 * 60 * 1000, // 5 minutes
    () => db.presentation.count({ where: { userId } })
  );
}

/**
 * Invalidate user-related caches
 */
export function invalidateUserCache(userId: string) {
  serverCache.invalidate(`user:${userId}`);
  serverCache.invalidatePattern(`presentations:${userId}:`);
  serverCache.invalidatePattern(`activity:${userId}:`);
  serverCache.invalidate(`presentation-count:${userId}`);
}

/**
 * Invalidate theme caches
 */
export function invalidateThemeCache(userId: string) {
  serverCache.invalidate(`themes:${userId}`);
}

/**
 * Batch load users (for reducing N+1 queries)
 */
export async function batchLoadUsers(userIds: string[]) {
  const uniqueIds = [...new Set(userIds)];
  const cacheKey = `users:batch:${uniqueIds.sort().join(',')}`;
  
  return cachedQuery(
    cacheKey,
    SERVER_CACHE_TTL.STATIC,
    async () => {
      const users = await db.user.findMany({
        where: { id: { in: uniqueIds } },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        }
      });
      
      // Return as Map for O(1) lookup
      return new Map(users.map(user => [user.id, user]));
    }
  );
}

/**
 * Get presentation by ID with caching
 */
export async function getCachedPresentation(presentationId: string) {
  return cachedQuery(
    `presentation:${presentationId}`,
    5 * 60 * 1000, // 5 minutes
    () => db.presentation.findUnique({
      where: { id: presentationId },
      include: {
        slides: true,
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

/**
 * Invalidate presentation cache
 */
export function invalidatePresentationCache(presentationId: string, userId?: string) {
  serverCache.invalidate(`presentation:${presentationId}`);
  if (userId) {
    serverCache.invalidatePattern(`presentations:${userId}:`);
    serverCache.invalidate(`presentation-count:${userId}`);
  }
}
