import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read PPTera's (PPTera) terms of service to understand the rules for using our AI PowerPoint generator platform. Know your rights and responsibilities.",
  keywords: ["terms of service", "terms and conditions", "user agreement", "legal", "terms", "usage policy", "PPTera", "PPTera", "PowerPoint terms", "AI PowerPoint"],
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service – PPTera",
    description: "Understand the terms and conditions for using PPTera AI PowerPoint generator.",
    url: "/terms",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPTera Terms of Service",
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
