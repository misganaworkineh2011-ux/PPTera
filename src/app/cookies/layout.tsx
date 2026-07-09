import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Cookie Policy - PPTera",
  description: "Learn about PPTera's cookie policy. Understand what cookies we use for our AI PowerPoint generator and how to manage your preferences.",
  keywords: ["cookie policy", "cookies", "tracking", "browser cookies", "cookie preferences", "cookie consent", "PPTera", "PowerPoint generator cookies"],
  alternates: {
    canonical: "/cookies",
  },
  openGraph: {
    title: "PPTera Cookie Policy",
    description: "Learn about how PPTera uses cookies and manage your preferences.",
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
