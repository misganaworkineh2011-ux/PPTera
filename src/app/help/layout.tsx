import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Help Center - PPT Master Support & FAQs",
  description: "Find answers to common questions about PPT Master. Browse guides, tutorials, and troubleshooting tips for AI PowerPoint generation.",
  keywords: ["help", "support", "faq", "how to", "tutorials", "guides", "troubleshooting", "help center", "PPT Master", "PowerPoint help", "AI PowerPoint support", "best PowerPoint generator help"],
  alternates: {
    canonical: "/help",
  },
  openGraph: {
    title: "PPT Master Help Center - PowerPoint Support & FAQs",
    description: "Find answers to common questions and get help with PPT Master AI PowerPoint generator.",
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
