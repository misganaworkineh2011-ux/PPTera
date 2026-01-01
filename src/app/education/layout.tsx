import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Education - PPT Master for Students & Teachers",
  description: "Special pricing for students, teachers, and schools. Get 50% off on all Pro plans with full access to AI presentation features.",
  keywords: ["education", "learn", "tutorials", "courses", "presentation skills", "design education", "AI learning", "PPT Master", "PowerPoint for students", "AI PowerPoint education", "best PowerPoint generator"],
  alternates: {
    canonical: "/education",
  },
  openGraph: {
    title: "PPT Master Education - Learn PowerPoint Design",
    description: "Special pricing for students, teachers, and schools. Get 50% off on all Pro plans with full AI features.",
    url: "/education",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPT Master Education",
      },
    ],
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
