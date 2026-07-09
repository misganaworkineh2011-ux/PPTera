import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Community - Connect with PPTera Users",
  description: "Join the PPTera community! Connect with PowerPoint creators, share AI-generated presentations, get feedback, and discover tips from experts worldwide.",
  keywords: ["community", "forum", "users", "share", "connect", "PPTera", "PowerPoint community", "AI PowerPoint users", "discussion", "user community"],
  alternates: {
    canonical: "/community",
  },
  openGraph: {
    title: "PPTera Community - Connect with PowerPoint Creators",
    description: "Join our community of AI PowerPoint creators and presentation enthusiasts.",
    url: "/community",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPTera Community",
      },
    ],
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
