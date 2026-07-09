import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read PPTera's (PPTera) privacy policy to understand how we collect, use, and protect your data when using our AI PowerPoint generator. Your privacy is our priority.",
  keywords: ["privacy policy", "data protection", "privacy", "GDPR", "data security", "user privacy", "PPTera", "PPTera", "PowerPoint privacy", "AI PowerPoint"],
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy – PPTera",
    description: "Learn how PPTera protects your data and respects your privacy.",
    url: "/privacy",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPTera Privacy Policy",
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
