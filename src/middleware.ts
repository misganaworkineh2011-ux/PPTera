import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
  "googlebot",
  "bingbot",
  "slurp",
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "whatsapp",
  "telegrambot",
];

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

// i18n configuration
const SUPPORTED_LANGUAGES = ["en", "es", "fr", "de", "zh", "pt", "it", "ja", "ko", "ar", "hi", "ru"];

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get("user-agent");

  // Skip i18n for API routes, static files, and protected routes
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/dashboard") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|gif|css|js|json|xml|txt)$/)
  ) {
    // Skip auth for bots on public pages
    if (isBot(userAgent) && !isProtectedRoute(request)) {
      return NextResponse.next();
    }

    // Protect specific routes
    if (isProtectedRoute(request)) {
      await auth.protect();
    }

    return NextResponse.next();
  }

  // Check if pathname already has a language prefix
  const pathnameHasLang = SUPPORTED_LANGUAGES.some(
    (lang) => pathname === `/${lang}` || pathname.startsWith(`/${lang}/`)
  );

  // If path has /en/ prefix, redirect to root path (canonical URL for English)
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const newPathname = pathname === "/en" ? "/" : pathname.replace(/^\/en/, "");
    const newUrl = new URL(newPathname, request.url);
    newUrl.search = request.nextUrl.search;
    
    const response = NextResponse.redirect(newUrl);
    response.cookies.set("NEXT_LOCALE", "en", {
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
    });
    return response;
  }

  // If no language in path, serve English content (root path = English)
  // Users can switch language via the language switcher which will navigate to /[lang]/
  if (!pathnameHasLang) {
    const response = NextResponse.next();
    // Don't override cookie - let user's preference persist for the language switcher
    return response;
  }

  // Extract language from pathname for non-English paths
  const lang = pathname.split("/")[1];
  
  // Set language cookie when visiting a language-prefixed path
  const currentCookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (lang && currentCookie !== lang && SUPPORTED_LANGUAGES.includes(lang)) {
    const response = NextResponse.next();
    response.cookies.set("NEXT_LOCALE", lang, {
      maxAge: 365 * 24 * 60 * 60, // 1 year
      path: "/",
    });
    return response;
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
