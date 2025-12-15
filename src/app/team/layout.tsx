import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Our Team - Meet PPTMaster Creators",
  description: "Meet the talented team behind PPTMaster. Learn about the people dedicated to revolutionizing presentation creation with AI technology.",
  keywords: ["team", "about team", "pptmaster team", "founders", "leadership", "our people"],
  alternates: {
    canonical: "/team",
  },
  openGraph: {
    title: "Meet the PPTMaster Team",
    description: "Meet the talented team behind PPTMaster's AI presentation technology.",
    url: "/team",
  },
};

export default function TeamLayout({
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
