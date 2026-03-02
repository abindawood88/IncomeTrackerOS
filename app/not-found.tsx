import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-start justify-center gap-4 px-6">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-sm opacity-80">
        The page you requested does not exist.
      </p>
      <Link
        href="/"
        className="rounded-md border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
      >
        Go home
      </Link>
    </main>
  );
}
