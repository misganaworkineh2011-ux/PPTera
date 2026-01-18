import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { GeistSans } from "geist/font/sans";
import { LanguageProvider } from "~/contexts/LanguageContext";
import { NavigationProvider } from "~/contexts/NavigationContext";
import GoogleAnalytics from "~/components/GoogleAnalytics";
import "~/styles/globals.css";
import { type Metadata, type Viewport } from "next";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.pptmaster.app'),
  title: {
    default: "PPTMaster: Free Stunning PowerPoint Generator",
    template: "%s | PPTMaster"
  },
  description: "PPTMaster creates professional presentations in seconds with AI. Free slide generator with 100+ themes. No design skills needed.",
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
  applicationName: "PPT Master",
  appleWebApp: {
    title: "PPT Master",
    statusBarStyle: "default",
    capable: true,
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
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
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    shortcut: [{ url: "/favicon.ico", type: "image/x-icon" }],
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "PPT Master",
    title: "PPTMaster: Free Stunning PowerPoint Generator",
    description: "PPTMaster creates professional presentations in seconds with AI. Free slide generator with 100+ themes.",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPTMaster - Free AI PowerPoint Generator",
        type: "image/jpeg",
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "PPTMaster: Free Stunning PowerPoint Generator",
    description: "PPTMaster creates professional presentations in seconds with AI. Free slide generator with 100+ themes.",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPT Master - Free AI PowerPoint Generator",
      }
    ],
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
    "alternateName": ["PPT Master", "PPTMaster"],
    "url": process.env.NEXT_PUBLIC_APP_URL || "https://www.pptmaster.app",
    "description": "PPTMaster is your free AI-powered design partner for creating stunning presentations effortlessly. No coding or design skills required.",
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
    "alternateName": ["PPT Master", "PPTMaster"],
    "url": process.env.NEXT_PUBLIC_APP_URL || "https://www.pptmaster.app",
    "logo": `${process.env.NEXT_PUBLIC_APP_URL || "https://www.pptmaster.app"}/logo.png`,
    "description": "PPTMaster (PPT Master) is the best AI-powered PowerPoint generator for creating professional presentations.",
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "url": `${process.env.NEXT_PUBLIC_APP_URL || "https://www.pptmaster.app"}/contact`,
      "availableLanguage": ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Japanese", "Korean", "Chinese", "Arabic", "Hindi", "Russian"]
    },
    "sameAs": []
  };

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "PPTMaster",
    "alternateName": ["PPT Master", "PPTMaster"],
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": "PPTMaster (PPT Master) is the best AI PowerPoint generator for creating professional presentations with artificial intelligence.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1342"
    }
  };

  return (
    <ClerkProvider>
      <html lang="en" className={GeistSans.variable}>
        <head>
          {/* Preconnect to critical third-party origins for faster loading */}
          <link rel="preconnect" href="https://clerk.pptmaster.app" />
          <link rel="dns-prefetch" href="https://clerk.pptmaster.app" />
          <link rel="preconnect" href="https://res.cloudinary.com" />
          <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        </head>
        <body className="font-sans bg-white">
          <GoogleAnalytics />
          {/* Minimal noscript fallback - doesn't interfere with SEO */}
          <noscript>
            <style>{`.js-only { display: none !important; }`}</style>
            <div style={{ padding: '1rem', textAlign: 'center', background: '#fef3c7', borderBottom: '1px solid #f59e0b' }}>
              <p style={{ margin: 0, color: '#92400e' }}>
                For the best experience, please enable JavaScript. 
                <a href="https://www.enable-javascript.com/" target="_blank" rel="noopener noreferrer" style={{ marginLeft: '0.5rem', color: '#1e40af', textDecoration: 'underline' }}>
                  Learn how
                </a>
              </p>
            </div>
          </noscript>
          <LanguageProvider>
            <NavigationProvider>
              {children}
            </NavigationProvider>
          </LanguageProvider>
          {/* Structured data placed after visible content for better SEO */}
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
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
