import Link from "next/link";

const TIERS = [
  {
    name: "FREE",
    price: "$0/mo",
    cta: "Start Free",
    href: "/onboard",
    highlight: false,
    features: ["1 portfolio", "3 holdings max", "Basic projections + Freedom Date", "Dividend calendar", "1 expense goal"],
  },
  {
    name: "PRO",
    price: "$10/mo",
    cta: "Upgrade to Pro",
    href: "/upgrade",
    highlight: true,
    features: ["Unlimited portfolios + holdings", "DRIP simulator", "Scenario planner", "Live ticker data", "CSV import/export + cloud sync"],
  },
  {
    name: "PRO+",
    price: "$20/mo",
    cta: "Upgrade to Pro+",
    href: "/upgrade",
    highlight: false,
    features: ["Everything in Pro", "AI portfolio insights", "Exportable PDF reports", "Brokerage sync (Phase 3)", "Advanced advisor workflows"],
  },
];

export default function PricingCards() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12" data-testid="pricing-cards">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-textBright">Simple pricing for every investor stage</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {TIERS.map((tier) => (
          <article
            key={tier.name}
            className={`rounded-2xl border p-5 ${tier.highlight ? "border-gold bg-gold/5" : "border-border bg-bg-2"}`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-textBright">{tier.name}</h3>
              {tier.highlight ? (
                <span className="rounded-full bg-gold px-2 py-1 text-xs font-semibold text-bg">Most Popular</span>
              ) : null}
            </div>
            <p className="mt-3 text-2xl font-bold text-textBright">{tier.price}</p>
            <ul className="mt-4 space-y-2 text-sm text-textDim">
              {tier.features.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
            <Link
              href={tier.href}
              className={`mt-6 inline-flex w-full justify-center rounded-lg px-4 py-2 text-sm font-semibold ${
                tier.highlight ? "bg-gold text-bg" : "border border-border text-textBright"
              }`}
              data-testid={`pricing-${tier.name.toLowerCase()}-cta`}
            >
              {tier.cta}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
