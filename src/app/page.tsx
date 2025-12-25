import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LandingPageClient } from "~/app/LandingPageClient";

export default async function HomePage() {
  // Check auth on server - redirect signed-in users immediately
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }

  // Render the client component for the landing page
  // The page structure is server-rendered, interactive parts are client-side
  return <LandingPageClient />;
}
