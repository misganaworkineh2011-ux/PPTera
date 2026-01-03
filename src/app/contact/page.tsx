import { ContactPageClient } from "./ContactPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the PPTMaster (PPT Master) team. We're here to help with questions, feedback, or partnership inquiries.",
  alternates: {
    canonical: "https://www.pptmaster.app/contact",
  },
  openGraph: {
    title: "Contact Us | PPTMaster",
    description: "Get in touch with the PPTMaster team. We're here to help with questions, feedback, or partnership inquiries.",
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
    title: "Contact Us | PPTMaster",
    description: "Get in touch with the PPTMaster team. We're here to help with questions or feedback.",
    images: ["/og-image.jpeg"],
  },
};

export const revalidate = 3600;

export default function ContactPage() {
  return <ContactPageClient currentLang="en" />;
}
