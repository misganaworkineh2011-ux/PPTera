import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Education - PPT Master for Students & Teachers",
  description: "Master PowerPoint design with PPT Master's educational resources. Learn to leverage the best AI PowerPoint generator for creating professional, engaging slides.",
  keywords: ["education", "learn", "tutorials", "courses", "presentation skills", "design education", "AI learning", "PPT Master", "PowerPoint for students", "AI PowerPoint education", "best PowerPoint generator"],
  alternates: {
    canonical: "/education",
  },
  openGraph: {
    title: "PPT Master Education - Learn PowerPoint Design",
    description: "Master PowerPoint design with AI-powered tools and expert guidance from PPT Master.",
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
