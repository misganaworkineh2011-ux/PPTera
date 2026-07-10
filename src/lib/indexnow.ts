/**
 * IndexNow Integration for instant search engine indexing
 * 
 * IndexNow is a protocol that allows websites to notify search engines
 * (Bing, Yandex, etc.) immediately when content is added, updated, or deleted.
 * 
 * This helps with:
 * - Faster indexing of new content
 * - Better SEO for ChatGPT (which uses Bing)
 * - Reduced crawl load on your server
 */

const INDEXNOW_KEY = "ee3c5ebf5bcd4e038842d7327ece7c32";
const SITE_HOST = "www.pptera.com";
const KEY_LOCATION = `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`;

// All supported languages (English uses root path, others use /[lang]/ prefix)
const SUPPORTED_LANGUAGES = ["en", "es", "fr", "de", "zh", "pt", "it", "ja", "ko", "ar", "hi", "ru"];

// IndexNow endpoints - submitting to one notifies all participating search engines
const INDEXNOW_ENDPOINTS = [
  "https://api.indexnow.org/indexnow",
  "https://www.bing.com/indexnow",
];

interface IndexNowResponse {
  success: boolean;
  message: string;
  endpoint?: string;
}

/**
 * Submit a single URL to IndexNow
 */
export async function submitUrlToIndexNow(url: string): Promise<IndexNowResponse> {
  return submitUrlsToIndexNow([url]);
}

/**
 * Submit multiple URLs to IndexNow (max 10,000 per request)
 */
export async function submitUrlsToIndexNow(urls: string[]): Promise<IndexNowResponse> {
  if (urls.length === 0) {
    return { success: false, message: "No URLs provided" };
  }

  if (urls.length > 10000) {
    return { success: false, message: "Maximum 10,000 URLs per request" };
  }

  // Ensure all URLs are absolute and belong to our domain
  const validUrls = urls.filter(url => {
    try {
      const parsed = new URL(url);
      return parsed.hostname === SITE_HOST || parsed.hostname === "pptera.com";
    } catch {
      return false;
    }
  });

  if (validUrls.length === 0) {
    return { success: false, message: "No valid URLs for this domain" };
  }

  const payload = {
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: validUrls,
  };

  // Try each endpoint until one succeeds
  for (const endpoint of INDEXNOW_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok || response.status === 200 || response.status === 202) {
        return {
          success: true,
          message: `Successfully submitted ${validUrls.length} URL(s) to IndexNow`,
          endpoint,
        };
      }

      // Handle specific error codes
      if (response.status === 400) {
        return { success: false, message: "Invalid format", endpoint };
      }
      if (response.status === 403) {
        return { success: false, message: "Invalid API key", endpoint };
      }
      if (response.status === 422) {
        return { success: false, message: "URLs don't belong to host or key mismatch", endpoint };
      }
      if (response.status === 429) {
        return { success: false, message: "Too many requests - rate limited", endpoint };
      }
    } catch (error) {
      console.error(`IndexNow submission failed for ${endpoint}:`, error);
      // Try next endpoint
      continue;
    }
  }

  return { success: false, message: "All IndexNow endpoints failed" };
}

/**
 * Helper to build full URL from path
 */
export function buildFullUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `https://${SITE_HOST}${cleanPath}`;
}

/**
 * Submit sitemap URLs to IndexNow (all pages, all languages)
 * Call this after deploying new content or on a schedule
 */
export async function submitSitemapToIndexNow(): Promise<IndexNowResponse> {
  // Static pages that have i18n versions
  const i18nPages = [
    "",           // home
    "/about",
    "/pricing",
    "/contact",
    "/help",
    "/prompt-guide",
    "/inspiration",
    "/insights",
    "/careers",
    "/community",
    "/education",
    "/privacy",
    "/terms",
    "/cookies",
  ];

  const urls: string[] = [];

  // Generate URLs for all languages
  for (const lang of SUPPORTED_LANGUAGES) {
    for (const page of i18nPages) {
      // English uses root path, other languages use /[lang]/ prefix
      const langPrefix = lang === "en" ? "" : `/${lang}`;
      urls.push(buildFullUrl(`${langPrefix}${page}`));
    }
  }

  return submitUrlsToIndexNow(urls);
}

/**
 * Submit URLs for a specific page in all languages
 */
export async function submitPageAllLanguages(pagePath: string): Promise<IndexNowResponse> {
  const urls: string[] = [];
  
  for (const lang of SUPPORTED_LANGUAGES) {
    const langPrefix = lang === "en" ? "" : `/${lang}`;
    urls.push(buildFullUrl(`${langPrefix}${pagePath}`));
  }

  return submitUrlsToIndexNow(urls);
}

/**
 * Get the IndexNow API key (for verification)
 */
export function getIndexNowKey(): string {
  return INDEXNOW_KEY;
}
