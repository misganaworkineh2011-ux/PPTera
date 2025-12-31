import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { GeistSans } from "geist/font/sans";
import { LanguageProvider } from "~/contexts/LanguageContext";
import { NavigationProvider } from "~/contexts/NavigationContext";
import "~/styles/globals.css";
import { type Metadata, type Viewport } from "next";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.pptmaster.app'),
  title: {
    default: "PPT Master | Best AI PowerPoint Generator & Presentation Maker",
    template: "%s | PPT Master"
  },
  description: "PPT Master is the best free AI-powered PowerPoint generator that helps you create stunning presentations and visuals effortlessly — no design or coding skills needed.",
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
    icon: "/favicon.ico",
  },
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
        alt: "PPTMaster - AI PowerPoint Generator | Best Free PowerPoint Maker"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "PPT Master: AI PowerPoint Generator | Best Free PowerPoint Maker",
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
      <html lang="en" className={GeistSans.variable}>
        <head>
          <meta name="theme-color" content="#ffffff" />
        </head>
        <body className="font-sans bg-white">
          <noscript>
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'white',
              zIndex: 9999,
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#0f172a' }}>
                  JavaScript Required
                </h1>
                <p style={{ fontSize: '1.125rem', color: '#64748b', marginBottom: '1.5rem' }}>
                  PPT Master requires JavaScript to run. Please enable JavaScript in your browser settings.
                </p>
                <a 
                  href="https://www.enable-javascript.com/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '0.75rem 2rem',
                    background: 'linear-gradient(to right, #1e3a8a, #06b6d4)',
                    color: 'white',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    textDecoration: 'none'
                  }}
                >
                  Learn How to Enable JavaScript
                </a>
              </div>
            </div>
          </noscript>
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
            <NavigationProvider>
              {children}
            </NavigationProvider>
          </LanguageProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
