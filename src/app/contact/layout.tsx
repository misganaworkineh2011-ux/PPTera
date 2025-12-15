import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Contact Us - PPTMaster Support",
  description: "Contact PPTMaster support for help with AI presentations, billing, technical issues, or partnerships. We're here to help!",
  keywords: ["contact", "support", "help", "customer service", "get in touch", "contact pptmaster"],
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact PPTMaster Support",
    description: "Get help with AI presentation generation, billing, or technical issues.",
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
