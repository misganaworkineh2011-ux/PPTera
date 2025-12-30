# Cost Optimization Guide - Vercel & Database

This guide provides actionable strategies to significantly reduce Vercel function execution costs and Neon database compute unit (CU) hours.

## 🎯 Quick Wins (Implement First)

### 1. Enable Next.js Static Generation for Public Pages
**Impact**: 80-90% reduction in function invocations for landing pages
**Effort**: Low

```typescript
// src/app/page.tsx - Make landing page static
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

// Apply to all public pages:
// - /about
// - /help
// - /pricing
// - /terms
// - /privacy
// - /cookies
// - /prompt-guide
```

### 2. Implement ISR (Incremental Static Regeneration)
**Impact**: 70% reduction in function calls for semi-static content
**Effort**: Low

```typescript
// src/app/insights/page.tsx
export const revalidate = 1800; // 30 minutes

// src/app/inspiration/page.tsx
export const revalidate = 3600; // 1 hour

// src/app/community/page.tsx
export const revalidate = 600; // 10 minutes
```

### 3. Add Database Connection Pooling
**Impact**: 50-60% reduction in database CU hours
**Effort**: Medium

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Add connection pooling
  directUrl = env("DIRECT_DATABASE_URL")
}

// .env
DATABASE_URL="postgres://...?pgbouncer=true&connection_limit=10"
DIRECT_DATABASE_URL="postgres://..." // For migrations only
```

### 4. Implement Query Result Caching
**Impact**: 40-50% reduction in database queries
**Effort**: Medium

Already have caching infrastructure, now apply it:

```typescript
// src/lib/db-cache.ts (NEW FILE)
import { serverCache, SERVER_CACHE_TTL } from './server-cache';
import { db } from '~/server/db';

export async function getCachedUser(userId: string) {
  return serverCache.get(`user:${userId}`) ?? 
    await db.user.findUnique({ where: { id: userId } })
      .then(user => {
        if (user) serverCache.set(`user:${userId}`, user, SERVER_CACHE_TTL.STATIC);
        return user;
      });
}

export async function getCachedPresentations(userId: string, limit = 12) {
  const key = `presentations:${userId}:${limit}`;
  return serverCache.get(key) ?? 
    await db.presentation.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' }
    }).then(presentations => {
      serverCache.set(key, presentations, 2 * 60 * 1000); // 2 min
      return presentations;
    });
}
```

## 🚀 High-Impact Optimizations

### 5. Reduce Database Query Complexity
**Impact**: 30-40% reduction in CU hours
**Effort**: Medium

```typescript
// BEFORE: Multiple queries
const user = await db.user.findUnique({ where: { id } });
const presentations = await db.presentation.findMany({ where: { userId: id } });
const themes = await db.theme.findMany({ where: { userId: id } });

// AFTER: Single query with select
const user = await db.user.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    email: true,
    credits: true,
    subscriptionPlan: true,
    // Only fetch counts, not full data
    _count: {
      select: {
        presentations: true,
        themes: true,
      }
    }
  }
});
```

### 6. Implement Edge Caching with Vercel KV (Optional)
**Impact**: 60-70% reduction for frequently accessed data
**Effort**: High
**Cost**: $1/month for 100K requests

```bash
npm install @vercel/kv
```

```typescript
// src/lib/edge-cache.ts
import { kv } from '@vercel/kv';

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  const cached = await kv.get<T>(key);
  if (cached) return cached;
  
  const data = await fetcher();
  await kv.setex(key, ttl, data);
  return data;
}

// Usage in API routes
const products = await getCachedData(
  'polar:products',
  () => fetchPolarProductsFromEnv(),
  3600 // 1 hour
);
```

### 7. Optimize Prisma Queries
**Impact**: 25-35% reduction in query time
**Effort**: Medium

```typescript
// Add indexes to frequently queried fields
// prisma/schema.prisma

model Presentation {
  // ... existing fields
  
  @@index([userId, createdAt(sort: Desc)]) // For dashboard queries
  @@index([shareToken]) // For shared presentations
  @@index([userId, isPinned]) // For pinned presentations
}

model Activity {
  // ... existing fields
  
  @@index([userId, createdAt(sort: Desc)]) // For activity feed
}

model Theme {
  // ... existing fields
  
  @@index([userId, isDefault]) // For theme queries
}
```

### 8. Implement Request Deduplication
**Impact**: 20-30% reduction in duplicate API calls
**Effort**: Low

```typescript
// Already have deduplicatedFetch in cache.ts
// Apply it to dashboard hooks

// src/lib/dashboard/hooks/useDashboardData.ts
import { deduplicatedFetch } from '~/lib/cache';

export function useDashboardData() {
  const { data, error, isLoading } = useSWR(
    '/api/dashboard/init',
    (url) => deduplicatedFetch(url), // Use deduplicated fetch
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
    }
  );
}
```

## 💰 Database-Specific Optimizations

### 9. Reduce Slide Data Storage
**Impact**: 40% reduction in storage and query costs
**Effort**: Medium

```typescript
// Store slides as JSONB instead of separate records
// This reduces joins and improves query performance

// BEFORE: Separate Slide model
model Slide {
  id String @id
  presentationId String
  content Json
  order Int
  presentation Presentation @relation(...)
}

// AFTER: Store in presentation
model Presentation {
  id String @id
  slides Json // Array of slide objects
  slideCount Int @default(0)
}
```

### 10. Implement Lazy Loading for Large Data
**Impact**: 50% reduction in initial page load queries
**Effort**: Medium

```typescript
// Don't load all presentations on dashboard init
// Load them on-demand with pagination

// src/app/api/presentations/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 12;
  
  const presentations = await db.presentation.findMany({
    where: { userId },
    take: limit,
    skip: (page - 1) * limit,
    select: {
      id: true,
      title: true,
      createdAt: true,
      // Don't load slides here
      _count: { select: { slides: true } }
    }
  });
  
  return NextResponse.json(presentations);
}
```

### 11. Archive Old Data
**Impact**: 30% reduction in query scan time
**Effort**: Low

```typescript
// Add soft delete and archive old presentations
// prisma/schema.prisma

model Presentation {
  // ... existing fields
  deletedAt DateTime?
  archivedAt DateTime?
  
  @@index([userId, deletedAt, archivedAt])
}

// Only query active presentations
const presentations = await db.presentation.findMany({
  where: {
    userId,
    deletedAt: null,
    archivedAt: null,
  }
});
```

## ⚡ Vercel-Specific Optimizations

### 12. Use Edge Runtime for Simple APIs
**Impact**: 70% faster, 50% cheaper
**Effort**: Low

```typescript
// src/app/api/user/me/route.ts
export const runtime = 'edge';

export async function GET() {
  // Simple user data fetch
  // Runs on edge, much faster and cheaper
}
```

### 13. Optimize Bundle Size
**Impact**: 20-30% reduction in cold start time
**Effort**: Medium

```typescript
// next.config.ts
const config: NextConfig = {
  // ... existing config
  
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@clerk/nextjs',
      'recharts',
    ],
  },
  
  // Tree shake unused code
  webpack: (config) => {
    config.optimization.usedExports = true;
    return config;
  },
};
```

### 14. Implement Streaming for Large Responses
**Impact**: Better UX, reduced timeout errors
**Effort**: Medium

```typescript
// src/app/api/generate/route.ts
export async function POST(req: Request) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // Stream AI responses chunk by chunk
      for await (const chunk of aiStream) {
        controller.enqueue(encoder.encode(JSON.stringify(chunk)));
      }
      controller.close();
    },
  });
  
  return new Response(stream);
}
```

### 15. Add Response Compression
**Impact**: 60-70% reduction in bandwidth costs
**Effort**: Low

```typescript
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  const response = NextResponse.next();
  
  // Enable compression for API responses
  if (request.url.includes('/api/')) {
    response.headers.set('Content-Encoding', 'gzip');
  }
  
  return response;
}
```

## 📊 Monitoring & Alerts

### 16. Set Up Cost Monitoring
**Effort**: Low

```typescript
// src/lib/monitoring.ts
export function logDatabaseQuery(query: string, duration: number) {
  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify({
      type: 'db_query',
      query,
      duration,
      timestamp: new Date().toISOString(),
    }));
  }
}

// Wrap Prisma client
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
  ],
});

prisma.$on('query', (e) => {
  logDatabaseQuery(e.query, e.duration);
});
```

## 🎯 Implementation Priority

### Week 1 (Quick Wins)
1. ✅ Enable static generation for public pages
2. ✅ Add ISR to semi-static pages
3. ✅ Implement database connection pooling
4. ✅ Apply existing caching to more queries

**Expected Savings**: 60-70% reduction

### Week 2 (High Impact)
5. ✅ Optimize Prisma queries with indexes
6. ✅ Implement request deduplication
7. ✅ Reduce database query complexity
8. ✅ Add lazy loading for large data

**Expected Savings**: Additional 20-30% reduction

### Week 3 (Advanced)
9. ✅ Consider Vercel KV for hot data
10. ✅ Implement edge runtime for simple APIs
11. ✅ Optimize bundle size
12. ✅ Set up monitoring

**Expected Savings**: Additional 10-15% reduction

## 💡 Cost Estimates

### Current (Estimated)
- Vercel: ~$20-50/month (Pro plan)
- Neon: ~$10-30/month (based on CU hours)
- **Total**: ~$30-80/month

### After Optimizations
- Vercel: ~$5-15/month (70% reduction)
- Neon: ~$3-10/month (70% reduction)
- **Total**: ~$8-25/month

### Potential Savings: $22-55/month (70-75% reduction)

## 🔍 Quick Audit Commands

```bash
# Check bundle size
npm run build
# Look for large chunks in .next/static

# Analyze database queries
# Add to prisma/schema.prisma:
# log = ["query", "info", "warn", "error"]

# Monitor Vercel function duration
# Check Vercel dashboard > Analytics > Functions

# Check database connection count
# Neon dashboard > Monitoring > Connections
```

## ⚠️ Common Pitfalls to Avoid

1. **Don't cache user-specific data globally** - Use user-scoped cache keys
2. **Don't set cache TTL too high** - Balance freshness vs cost
3. **Don't forget to invalidate cache** - On mutations, clear related cache
4. **Don't load all data upfront** - Use pagination and lazy loading
5. **Don't skip database indexes** - They're crucial for query performance

## 📈 Measuring Success

Track these metrics weekly:
- Vercel function invocations (should decrease 60-70%)
- Average function duration (should decrease 30-40%)
- Database CU hours (should decrease 60-70%)
- Cache hit rate (should be >70%)
- Page load time (should improve 40-50%)

## 🚀 Next Steps

1. Start with Week 1 optimizations
2. Monitor metrics for 3-5 days
3. Implement Week 2 optimizations
4. Review cost dashboard
5. Fine-tune cache TTLs based on usage patterns
