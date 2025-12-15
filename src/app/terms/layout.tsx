import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Terms of Service - Usage Agreement",
  description: "Read PPTMaster's terms of service to understand the rules for using our AI presentation platform. Know your rights and responsibilities.",
  keywords: ["terms of service", "terms and conditions", "user agreement", "legal", "terms", "usage policy"],
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "PPTMaster Terms of Service",
    description: "Understand the terms and conditions for using PPTMaster.",
    url: "/terms",
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
