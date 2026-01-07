import CommunityPageClient from "./CommunityPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community | PPTMaster – Connect with Presentation Creators",
  description: "Join the PPTMaster (PPT Master) community. Connect with creators, share your work, get feedback, and learn presentation tips from experts worldwide.",
  alternates: {
    canonical: "https://www.pptmaster.app/community",
  },
  keywords: "PPTMaster community, presentation community, PowerPoint community, design feedback, presentation tips, creator network",
  openGraph: {
    title: "Community | PPTMaster – Connect with Users",
    description: "Join the PPTMaster community. Connect with creators, share your work, get feedback, and learn presentation tips.",
    url: "https://www.pptmaster.app/community",
    type: "website",
    images: [
      {
        url: "https://www.pptmaster.app/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPTMaster Community",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Community | PPTMaster – Connect with Users",
    description: "Join the PPTMaster community. Connect with creators, share your work, and learn presentation tips.",
    images: ["https://www.pptmaster.app/og-image.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function CommunityPage() {
  return <CommunityPageClient currentLang="en" />;
}
