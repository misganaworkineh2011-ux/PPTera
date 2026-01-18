import { ContactPageClient } from "./ContactPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Get Support for AI PowerPoint Generator | PPTMaster",
  description: "Contact PPTMaster support team. Get help with AI PowerPoint generation, billing, features, or partnership inquiries. We're here to help 24/7.",
  alternates: {
    canonical: "https://www.pptmaster.app/contact",
  },
  openGraph: {
    title: "Contact Us - Get Support for AI PowerPoint Generator | PPTMaster",
    description: "Contact PPTMaster support team. Get help with AI PowerPoint generation, billing, or partnership inquiries.",
    url: "/contact",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "Contact PPTMaster",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us - Get Support | PPTMaster",
    description: "Contact PPTMaster support team. Get help with AI PowerPoint generation or partnership inquiries.",
    images: ["/og-image.jpeg"],
  },
};

export const revalidate = 3600;

export default function ContactPage() {
  return <ContactPageClient currentLang="en" />;
}
