import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Community - Connect with PPT Master Users",
  description: "Join the PPT Master community! Connect with PowerPoint creators, share AI-generated presentations, get feedback, and discover tips from experts worldwide.",
  keywords: ["community", "forum", "users", "share", "connect", "PPT Master", "PowerPoint community", "AI PowerPoint users", "discussion", "user community"],
  alternates: {
    canonical: "/community",
  },
  openGraph: {
    title: "PPT Master Community - Connect with PowerPoint Creators",
    description: "Join our community of AI PowerPoint creators and presentation enthusiasts.",
    url: "/community",
  },
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Breadcrumbs />
      {children}
    </>
  );
}
