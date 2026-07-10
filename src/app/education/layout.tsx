import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Education - PPTera for Students & Teachers",
  description: "Special pricing for students, teachers, and schools. Get 50% off on PPTera Pro plans with full premium access to AI presentation tools.",
  alternates: {
    canonical: "https://www.pptera.com/education",
  },
  openGraph: {
    title: "Education - PPTera for Students & Teachers",
    description: "Special pricing for students, teachers, and schools. Get 50% off on PPTera Pro plans.",
    url: "/education",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPTera Education Plans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Education - PPTera for Students & Teachers",
    description: "Special pricing for students, teachers, and schools. Get 50% off on Pro plans.",
    images: ["/og-image.jpeg"],
  },
};

export default function EducationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
