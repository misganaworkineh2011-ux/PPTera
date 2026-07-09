import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Contact Us - PPTera Support",
  description: "Contact PPTera support for help with AI PowerPoint generation, billing, technical issues, or partnerships. We're here to help!",
  keywords: ["contact", "support", "help", "customer service", "get in touch", "contact pptera", "PPTera", "PowerPoint support", "AI PowerPoint help"],
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact PPTera Support",
    description: "Get help with AI PowerPoint generation, billing, or technical issues.",
    url: "/contact",
  },
};

export default function ContactLayout({
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
