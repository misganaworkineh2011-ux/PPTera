import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Privacy Policy - PPT Master Data Protection",
  description: "Read PPT Master's privacy policy to understand how we collect, use, and protect your data when using our AI PowerPoint generator. Your privacy is our priority.",
  keywords: ["privacy policy", "data protection", "privacy", "GDPR", "data security", "user privacy", "PPT Master", "PowerPoint privacy", "AI PowerPoint"],
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "PPT Master Privacy Policy",
    description: "Learn how PPT Master protects your data and respects your privacy.",
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
