import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Privacy Policy - Data Protection",
  description: "Read PPTMaster's privacy policy to understand how we collect, use, and protect your data. Your privacy is our priority.",
  keywords: ["privacy policy", "data protection", "privacy", "GDPR", "data security", "user privacy"],
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "PPTMaster Privacy Policy",
    description: "Learn how we protect your data and respect your privacy.",
    url: "/privacy",
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
