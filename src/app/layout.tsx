import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { LanguageProvider } from "~/contexts/LanguageContext";
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
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        </head>
        <body className="font-sans">
          <LanguageProvider>
            {children}
          </LanguageProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
