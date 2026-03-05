import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 pt-8 text-center">
      <p className="mb-4 text-sm uppercase tracking-wide text-gold">The OS for Dividend Investors</p>
      <h1 className="text-4xl font-bold leading-tight text-textBright md:text-5xl" data-testid="hero-headline">
        Know Exactly When Your Dividends Will Replace Your Salary.
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-base text-textDim md:text-lg" data-testid="hero-subheadline">
        Track your ETF income, simulate DRIP growth, and find your Freedom Date — all in one
        dashboard.
      </p>
      <Link
        href="/onboard"
        className="mt-8 inline-flex rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-bg"
        data-testid="hero-cta"
      >
        Start Free →
      </Link>
    </section>
  );
}
