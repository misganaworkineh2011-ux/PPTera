import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read PPTMaster's (PPT Master) privacy policy to understand how we collect, use, and protect your data when using our AI PowerPoint generator. Your privacy is our priority.",
  keywords: ["privacy policy", "data protection", "privacy", "GDPR", "data security", "user privacy", "PPTMaster", "PPT Master", "PowerPoint privacy", "AI PowerPoint"],
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy – PPTMaster",
    description: "Learn how PPTMaster protects your data and respects your privacy.",
    url: "/privacy",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPTMaster Privacy Policy",
      },
    ],
  },
};

export default function PrivacyLayout({
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
