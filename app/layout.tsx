import "./globals.css";
import type { Metadata } from "next";
import AppProviders from "@/components/ui/AppProviders";

export const metadata: Metadata = {
  title: "Dividend Freedom Pro",
  description: "Dividend income projection & financial independence tracking",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-bg text-textBright antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
