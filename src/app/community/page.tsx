import CommunityPageClient from "./CommunityPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community",
  description: "Join the PPTMaster (PPT Master) community. Connect with creators, share your work, get feedback, and learn presentation tips.",
  alternates: {
    canonical: "https://www.pptmaster.app/community",
  },
  openGraph: {
    title: "Community | PPTMaster – Connect with Users",
    description: "Join the PPTMaster community. Connect with creators, share your work, get feedback, and learn presentation tips.",
    url: "/community",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
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
    images: ["/og-image.jpeg"],
  },
};

export default function CommunityPage() {
  return <CommunityPageClient currentLang="en" />;
}
