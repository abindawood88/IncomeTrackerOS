const TESTIMONIALS = [
  { name: "Investor Name", role: "Dividend Builder", quote: "[Owner to add final testimonial copy before launch.]" },
  { name: "Investor Name", role: "FIRE Optimizer", quote: "[Owner to add final testimonial copy before launch.]" },
  { name: "Investor Name", role: "Long-Term Investor", quote: "[Owner to add final testimonial copy before launch.]" },
];

export default function SocialProof() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12" data-testid="social-proof">
      <h2 className="mb-6 text-center text-2xl font-bold text-textBright">Built for real dividend investors</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {TESTIMONIALS.map((item, index) => (
          <article key={`${item.role}-${index}`} className="rounded-2xl border border-border bg-bg-2 p-5">
            <div className="mb-3 h-10 w-10 rounded-full bg-bg-3" aria-hidden />
            <p className="text-sm text-textDim">“{item.quote}”</p>
            <p className="mt-4 font-semibold text-textBright">{item.name}</p>
            <p className="text-xs text-textDim">{item.role}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
