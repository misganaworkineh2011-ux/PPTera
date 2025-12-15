import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Community - Connect with Users",
  description: "Join the PPTMaster community! Connect with users, share presentations, get feedback, and discover tips from experts worldwide.",
  keywords: ["community", "forum", "users", "share", "connect", "discussion", "user community"],
  alternates: {
    canonical: "/community",
  },
  openGraph: {
    title: "PPTMaster Community - Connect with Users",
    description: "Join our community of presentation creators and AI enthusiasts.",
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
