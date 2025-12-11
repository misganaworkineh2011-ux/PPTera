import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "~/styles/globals.css";

export const metadata = {
  title: "PPTMaster - AI-Powered Presentation Generator",
  description: "Create stunning presentations with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
