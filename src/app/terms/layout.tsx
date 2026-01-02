import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Terms of Service - PPT Master Usage Agreement",
  description: "Read PPT Master's terms of service to understand the rules for using our AI PowerPoint generator platform. Know your rights and responsibilities.",
  keywords: ["terms of service", "terms and conditions", "user agreement", "legal", "terms", "usage policy", "PPT Master", "PowerPoint terms", "AI PowerPoint"],
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "PPT Master Terms of Service",
    description: "Understand the terms and conditions for using PPT Master AI PowerPoint generator.",
    url: "/terms",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPT Master Terms of Service",
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
