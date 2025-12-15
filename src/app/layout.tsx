import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { LanguageProvider } from "~/contexts/LanguageContext";
import "~/styles/globals.css";
import { type Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.pptmaster.app'),
  title: {
    default: "PPTMaster: AI Presentation Generator | Free PPT Maker",
    template: "%s | PPTMaster"
  },
  description: "Create stunning presentations with AI in seconds. Free AI-powered PPT maker that transforms your ideas into professional slides instantly.",
  keywords: [
    "AI presentation generator",
    "PPT maker",
    "PowerPoint generator",
    "AI slide creator",
    "presentation maker",
    "AI PPT generator",
    "automatic presentation creator",
    "slide design AI",
    "presentation software",
    "AI document generator",
    "free presentation maker",
    "PPTMaster",
    "create presentations online",
    "AI powered slides"
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
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "PPTMaster",
    title: "PPTMaster: AI Presentation Generator | Free PPT Maker",
    description: "Create stunning presentations with AI in seconds. Transform your ideas into professional slides instantly with PPTMaster.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PPTMaster - AI Presentation Generator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "PPTMaster: AI Presentation Generator",
    description: "Create professional presentations with AI. Transform ideas into stunning slides instantly with PPTMaster.",
    images: ["/og-image.png"],
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
    "name": "PPTMaster",
    "url": process.env.NEXT_PUBLIC_APP_URL || "https://www.pptmaster.app",
    "description": "AI-powered presentation generator that creates professional slides, documents, and social media content instantly.",
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
    "name": "PPTMaster",
    "url": process.env.NEXT_PUBLIC_APP_URL || "https://www.pptmaster.app",
    "logo": `${process.env.NEXT_PUBLIC_APP_URL || "https://www.pptmaster.app"}/logo.png`,
    "description": "AI-powered presentation generator for creating professional presentations, documents, and social media content.",
    "sameAs": []
  };

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "PPTMaster",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
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
