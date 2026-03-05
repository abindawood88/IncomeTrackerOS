const FEATURES = [
  { icon: "📈", title: "Income Timeline", benefit: "Project monthly dividend income for the next 30 years with clear milestones." },
  { icon: "🎯", title: "Freedom Score", benefit: "Track how much of your monthly expenses are covered by your dividend cash flow." },
  { icon: "📅", title: "Dividend Calendar", benefit: "See expected weekly and monthly paydays so you can plan cash flow confidently." },
  { icon: "❄️", title: "DRIP Simulator", benefit: "Compare dividend reinvestment ON vs OFF and see compounding snowball differences." },
  { icon: "🧪", title: "Scenario Planner", benefit: "Run what-if simulations for crashes, pauses, and extra contributions in seconds." },
  { icon: "🌱", title: "Yield Growth Tracker", benefit: "Monitor yield-on-cost and year-over-year income acceleration as your portfolio matures." },
];

export default function FeaturesGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12" data-testid="features-grid">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <article key={feature.title} className="rounded-2xl border border-border bg-bg-2 p-5">
            <div className="text-2xl">{feature.icon}</div>
            <h2 className="mt-3 text-lg font-semibold text-textBright">{feature.title}</h2>
            <p className="mt-2 text-sm text-textDim">{feature.benefit}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
