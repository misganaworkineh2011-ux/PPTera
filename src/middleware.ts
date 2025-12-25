import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/generate(.*)",
  "/api/user(.*)",
  "/api/presentations(.*)",
  "/api/credits(.*)",
  "/api/cron(.*)",
]);

// Known search engine bot user agents
const BOT_USER_AGENTS = [
  'googlebot',
  'bingbot',
  'slurp',
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegrambot',
];

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some(bot => ua.includes(bot));
}

export default clerkMiddleware(async (auth, request) => {
  const userAgent = request.headers.get('user-agent');
  
  // Skip auth for bots on public pages - let them crawl freely
  if (isBot(userAgent) && !isProtectedRoute(request)) {
    return NextResponse.next();
  }
  
  // Only protect specific routes - everything else is public
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    // Also skip SEO files: sitemap.xml, robots.txt
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
