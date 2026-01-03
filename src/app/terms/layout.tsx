import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read PPTMaster's (PPT Master) terms of service to understand the rules for using our AI PowerPoint generator platform. Know your rights and responsibilities.",
  keywords: ["terms of service", "terms and conditions", "user agreement", "legal", "terms", "usage policy", "PPTMaster", "PPT Master", "PowerPoint terms", "AI PowerPoint"],
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service – PPTMaster",
    description: "Understand the terms and conditions for using PPTMaster AI PowerPoint generator.",
    url: "/terms",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPTMaster Terms of Service",
      },
    ],
  },
};

export default function TermsLayout({
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
