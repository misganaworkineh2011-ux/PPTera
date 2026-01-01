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
  themeColor: '#ffffff',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.pptmaster.app'),
  title: {
    default: "PPT Master | Best AI PowerPoint Generator & Presentation Maker",
    template: "%s | PPT Master"
  },
  description: "Create stunning AI presentations in seconds. PPT Master is the best free PowerPoint generator for professionals and teams.",
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
    title: "PPT Master: AI PowerPoint Generator | Best Free PowerPoint Maker",
    description: "Create stunning AI presentations in seconds. Transform your ideas into professional slides with PPT Master.",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPTMaster - AI PowerPoint Generator | Best Free PowerPoint Maker",
        type: "image/jpeg",
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "PPT Master: AI PowerPoint Generator | Best Free PowerPoint Maker",
    description: "Create professional AI presentations in seconds. Transform ideas into stunning slides with PPT Master.",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPT Master - AI PowerPoint Generator",
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
                <p style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#0f172a' }}>
                  JavaScript Required
                </p>
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
