"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ToastProvider } from "@/components/ui/ToastProvider";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (publishableKey) {
    return (
      <ClerkProvider publishableKey={publishableKey}>
        <ToastProvider>{children}</ToastProvider>
      </ClerkProvider>
    );
  }

  return <ToastProvider>{children}</ToastProvider>;
}
