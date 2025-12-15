import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/pricing",
  "/about",
  "/team",
  "/careers",
  "/contact",
  "/help",
  "/privacy",
  "/terms",
  "/cookies",
  "/insights",
  "/inspiration",
  "/education",
  "/community",
  "/templates",
  "/prompt-guide",
  "/developer-docs",
  "/api/webhooks/clerk(.*)",
  "/api/webhooks/polar(.*)",
  "/api/polar/products(.*)",
  "/api/polar/lifetime",
  "/api/careers/jobs",
  "/api/insights",
  "/api/inspiration",
  "/api/community/posts",
  "/sitemap.xml",
  "/robots.txt",
  "/sitemap",
  "/robots",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
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
