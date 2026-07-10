import { NextResponse } from "next/server";
import { submitUrlsToIndexNow, submitSitemapToIndexNow, submitPageAllLanguages, buildFullUrl } from "~/lib/indexnow";

/**
 * IndexNow API Route
 * 
 * POST /api/indexnow - Submit URLs to IndexNow for instant indexing
 * 
 * Body options:
 * - { urls: string[] } - Submit specific URLs
 * - { sitemap: true } - Submit all sitemap URLs (all pages, all languages)
 * - { path: string } - Submit a single path (will be converted to full URL)
 * - { path: string, allLanguages: true } - Submit a page in all languages
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Option 1: Submit all sitemap URLs (all pages, all languages)
    if (body.sitemap === true) {
      const result = await submitSitemapToIndexNow();
      return NextResponse.json(result, { 
        status: result.success ? 200 : 400 
      });
    }

    // Option 2: Submit a page in all languages
    if (body.path && body.allLanguages === true) {
      const result = await submitPageAllLanguages(body.path);
      return NextResponse.json(result, { 
        status: result.success ? 200 : 400 
      });
    }

    // Option 3: Submit a single path
    if (body.path && typeof body.path === "string") {
      const url = buildFullUrl(body.path);
      const result = await submitUrlsToIndexNow([url]);
      return NextResponse.json(result, { 
        status: result.success ? 200 : 400 
      });
    }

    // Option 4: Submit multiple URLs
    if (body.urls && Array.isArray(body.urls)) {
      const result = await submitUrlsToIndexNow(body.urls);
      return NextResponse.json(result, { 
        status: result.success ? 200 : 400 
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid request body. Provide 'urls', 'path', 'path + allLanguages', or 'sitemap: true'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("IndexNow API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/indexnow - Health check and info
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "IndexNow",
    description: "Submit URLs to search engines for instant indexing (Bing, Yandex, ChatGPT)",
    supportedLanguages: 12,
    endpoints: {
      "POST /api/indexnow": {
        description: "Submit URLs to IndexNow",
        body: {
          "sitemap": "boolean - Submit all sitemap URLs (all pages, all 12 languages = 168 URLs)",
          "path": "string - Submit a single path",
          "path + allLanguages": "Submit a page in all 12 languages",
          "urls": "string[] - Submit multiple full URLs",
        },
        examples: [
          { sitemap: true },
          { path: "/pricing", allLanguages: true },
          { path: "/insights/my-new-post" },
          { urls: ["https://www.pptera.com/insights/post-1", "https://www.pptera.com/insights/post-2"] },
        ],
      },
    },
  });
}
