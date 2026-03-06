import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastProvider } from "@/components/ui/ToastProvider";

export const metadata: Metadata = {
  title: "Dividend Freedom Pro",
  description: "Dividend income projection & financial independence tracking",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const app = <ToastProvider>{children}</ToastProvider>;

  return (
    <html lang="en">
      <body className="bg-bg text-textBright antialiased">
        {publishableKey ? <ClerkProvider publishableKey={publishableKey}>{app}</ClerkProvider> : app}
      </body>
    </html>
  );
}
