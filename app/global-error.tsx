"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-start justify-center gap-4 px-6">
          <h1 className="text-2xl font-semibold">Application error</h1>
          <p className="text-sm opacity-80">
            {error.message || "A fatal error occurred."}
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
          >
            Reload app
          </button>
        </main>
      </body>
    </html>
  );
}
