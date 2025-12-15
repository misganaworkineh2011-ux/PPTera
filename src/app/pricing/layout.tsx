import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Pricing - Affordable AI Presentation Plans",
  description: "Choose the perfect plan for your needs. Free tier with 10 credits monthly. Flexible monthly and yearly plans for unlimited AI presentations.",
  keywords: ["pricing", "plans", "subscription", "free presentation maker", "PPT pricing", "affordable AI", "presentation plans"],
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "PPTMaster Pricing - Affordable AI Presentation Plans",
    description: "Choose the perfect plan for your presentation needs. Free tier available.",
    url: "/pricing",
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
