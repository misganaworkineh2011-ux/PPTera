import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Education - Learn AI Presentation Design",
  description: "Master presentation design with PPTMaster's educational resources. Learn to leverage AI for creating professional, engaging slides.",
  keywords: ["education", "learn", "tutorials", "courses", "presentation skills", "design education", "AI learning"],
  alternates: {
    canonical: "/education",
  },
  openGraph: {
    title: "PPTMaster Education - Learn Presentation Design",
    description: "Master presentation design with AI-powered tools and expert guidance.",
    url: "/education",
  },
};

export default function EducationLayout({
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
