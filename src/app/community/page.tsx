import CommunityPageClient from "./CommunityPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community - Connect with PowerPoint Creators | PPTMaster",
  description: "Join PPTMaster community of 100K+ presentation creators. Share AI-generated slides, get feedback, learn tips, and connect with PowerPoint experts worldwide.",
  alternates: {
    canonical: "https://www.pptmaster.app/community",
  },
  keywords: "PPTMaster community, presentation community, PowerPoint community, design feedback, presentation tips, creator network",
  openGraph: {
    title: "Community - Connect with PowerPoint Creators | PPTMaster",
    description: "Join PPTMaster community. Share AI-generated slides, get feedback, and connect with PowerPoint experts.",
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
    title: "Community - Connect with Creators | PPTMaster",
    description: "Join PPTMaster community. Share slides, get feedback, and connect with experts.",
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
