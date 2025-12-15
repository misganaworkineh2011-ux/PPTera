import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Careers - Join PPTMaster Team",
  description: "Join PPTMaster and shape the future of AI presentations. Explore open positions and join our innovative team.",
  keywords: ["careers", "jobs", "hiring", "work at pptmaster", "job openings", "join our team"],
  alternates: {
    canonical: "/careers",
  },
  openGraph: {
    title: "Careers at PPTMaster - Join Our Team",
    description: "Join PPTMaster and help shape the future of AI-powered presentations.",
    url: "/careers",
  },
};

export default function CareersLayout({
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
