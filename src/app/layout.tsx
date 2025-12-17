import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { LanguageProvider } from "~/contexts/LanguageContext";
import "~/styles/globals.css";
import { type Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.pptmaster.app'),
  title: {
    default: "PPTMaster | Best AI PowerPoint Generator & Presentation Maker",
    template: "%s | PPT Master"
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  description: "PPTMaster is the best free AI-powered PowerPoint generator that helps you create stunning presentations and visuals effortlessly — no design or coding skills needed.",
  keywords: [
    "PPTMaster",
    "AI presentation generator",
    "PowerPoint generator",
    "AI PowerPoint",
    "best PowerPoint generator",
    "AI PowerPoint generator",
    "free PowerPoint maker",
    "PPT maker",
    "AI slide creator",
    "presentation maker",
    "AI PPT generator",
    "automatic presentation creator",
    "slide design AI",
    "presentation software",
    "AI document generator",
    "free presentation maker",
    "create presentations online",
    "AI powered slides",
    "PowerPoint AI",
    "best AI PowerPoint"
  ],
  authors: [{ name: "PPTMaster" }],
  creator: "PPTMaster",
  publisher: "PPTMaster",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "android-chrome", url: "/favicon/android-chrome-192x192.png", sizes: "192x192" },
      { rel: "android-chrome", url: "/favicon/android-chrome-512x512.png", sizes: "512x512" },
    ],
  },
  manifest: "/favicon/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "PPT Master",
    title: "PPT Master: AI PowerPoint Generator | Best Free PowerPoint Maker",
    description: "Create stunning PowerPoint presentations with AI in seconds. Transform your ideas into professional slides instantly with PPT Master, the best AI PowerPoint generator.",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPTMaster - AI Presentation Generator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "PPT Master: AI PowerPoint Generator",
    description: "Create professional PowerPoint presentations with AI. Transform ideas into stunning slides instantly with PPT Master, the best AI PowerPoint generator.",
    images: ["/og-image.jpeg"],
    site: "@pptmaster",
    creator: "@pptmaster",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "PPT Master",
    "alternateName": "PPTMaster",
    "url": process.env.NEXT_PUBLIC_APP_URL || "https://www.pptmaster.app",
    "description": "PPT Master is the best AI-powered PowerPoint generator that creates professional presentations, slides, documents, and social media content instantly.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${process.env.NEXT_PUBLIC_APP_URL || "https://www.pptmaster.app"}/?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PPT Master",
    "alternateName": "PPTMaster",
    "url": process.env.NEXT_PUBLIC_APP_URL || "https://www.pptmaster.app",
    "logo": `${process.env.NEXT_PUBLIC_APP_URL || "https://www.pptmaster.app"}/logo.png`,
    "description": "PPT Master is the best AI-powered PowerPoint generator for creating professional presentations, documents, and social media content.",
    "sameAs": []
  };

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "PPT Master",
    "alternateName": "PPTMaster",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": "PPTMaster is the best AI PowerPoint generator for creating professional presentations with artificial intelligence.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250"
    }
  };

  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        </head>
        <body className="font-sans">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
          />
          <LanguageProvider>
            {children}
          </LanguageProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
