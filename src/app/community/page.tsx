import CommunityPageClient from "./CommunityPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community - Connect with PPT Master Users",
  description: "Join the PPT Master community to connect with presentation creators worldwide. Share your work, get feedback, learn tips and tricks, request features, and be part of the AI presentation revolution.",
  alternates: {
    canonical: "https://www.pptmaster.app/community",
  },
};

export default function CommunityPage() {
  return <CommunityPageClient currentLang="en" />;
}
