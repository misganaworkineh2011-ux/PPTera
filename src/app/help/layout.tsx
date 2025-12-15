import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Help Center - Support & FAQs",
  description: "Find answers to common questions about PPTMaster. Browse guides, tutorials, and troubleshooting tips for AI presentation generation.",
  keywords: ["help", "support", "faq", "how to", "tutorials", "guides", "troubleshooting", "help center"],
  alternates: {
    canonical: "/help",
  },
  openGraph: {
    title: "PPTMaster Help Center - Support & FAQs",
    description: "Find answers to common questions and get help with PPTMaster.",
    url: "/help",
  },
};

export default function HelpLayout({
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
