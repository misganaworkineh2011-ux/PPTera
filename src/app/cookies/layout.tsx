import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Cookie Policy - How We Use Cookies",
  description: "Learn about PPTMaster's cookie policy. Understand what cookies we use, why, and how to manage your preferences.",
  keywords: ["cookie policy", "cookies", "tracking", "browser cookies", "cookie preferences", "cookie consent"],
  alternates: {
    canonical: "/cookies",
  },
  openGraph: {
    title: "PPTMaster Cookie Policy",
    description: "Learn about how we use cookies and manage your preferences.",
    url: "/cookies",
  },
};

export default function CookiesLayout({
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
