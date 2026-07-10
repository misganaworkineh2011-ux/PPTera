import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.pptera.com";
  
  return {
    rules: [
      {
        // General rules for all crawlers including Bingbot (important for ChatGPT)
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/dashboard/",
          "/api/",
          "/sign-in/",
          "/sign-up/",
          "/present/",
          "/embed/",
          "/share/",
          "/createpresentation/",
          "/presentation/",
        ],
      },
      {
        // Specific rules for Bingbot (ChatGPT uses Bing for web browsing)
        userAgent: "bingbot",
        allow: ["/"],
        disallow: [
          "/dashboard/",
          "/api/",
          "/sign-in/",
          "/sign-up/",
          "/present/",
          "/embed/",
          "/share/",
          "/createpresentation/",
          "/presentation/",
        ],
      },
      {
        // ChatGPT-User bot
        userAgent: "ChatGPT-User",
        allow: ["/"],
        disallow: [
          "/dashboard/",
          "/api/",
          "/sign-in/",
          "/sign-up/",
          "/present/",
          "/embed/",
          "/share/",
          "/createpresentation/",
          "/presentation/",
        ],
      },
      {
        // GPTBot (OpenAI's crawler)
        userAgent: "GPTBot",
        allow: ["/"],
        disallow: [
          "/dashboard/",
          "/api/",
          "/sign-in/",
          "/sign-up/",
          "/present/",
          "/embed/",
          "/share/",
          "/createpresentation/",
          "/presentation/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
