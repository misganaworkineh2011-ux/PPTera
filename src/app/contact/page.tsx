import { ContactPageClient } from "./ContactPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - PPT Master",
  description: "Get in touch with the PPT Master team. We're here to help with any questions or feedback.",
};

export const revalidate = 3600;

export default function ContactPage() {
  return <ContactPageClient currentLang="en" />;
}
