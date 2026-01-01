import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Pricing - PPT Master AI PowerPoint Plans",
  description: "Choose the perfect PPT Master plan for your needs. Free tier available. Flexible plans for unlimited AI PowerPoint generation with the best PowerPoint generator.",
  keywords: ["pricing", "plans", "subscription", "free presentation maker", "PPT pricing", "affordable AI", "presentation plans", "PPT Master", "PowerPoint pricing", "AI PowerPoint plans", "best PowerPoint generator"],
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "PPT Master Pricing - Affordable AI PowerPoint Plans",
    description: "Choose the perfect plan for your PowerPoint needs with PPT Master. Free tier available.",
    url: "/pricing",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPT Master Pricing - AI PowerPoint Plans",
      },
    ],
  },
};

export default function PricingLayout({
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
