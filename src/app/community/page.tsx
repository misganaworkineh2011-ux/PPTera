import CommunityPageClient from "./CommunityPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community - Connect with PPT Master Users",
  description: "Join the PPT Master community. Connect with creators, share your work, get feedback, and learn presentation tips.",
  alternates: {
    canonical: "https://www.pptmaster.app/community",
  },
};

export default function CommunityPage() {
  return <CommunityPageClient currentLang="en" />;
}
