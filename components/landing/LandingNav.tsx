import Link from "next/link";

export default function LandingNav() {
  return (
    <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6">
      <Link href="/" className="text-lg font-semibold text-textBright" data-testid="landing-logo">
        IncomeTrackerOS
      </Link>
      <div className="flex items-center gap-3">
        <Link
          href="/sign-in"
          className="rounded-lg border border-border px-4 py-2 text-sm text-textDim transition hover:text-textBright"
          data-testid="landing-sign-in"
        >
          Sign In
        </Link>
        <Link
          href="/onboard"
          className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-bg transition hover:opacity-90"
          data-testid="landing-start-free"
        >
          Start Free →
        </Link>
      </div>
    </nav>
  );
}
