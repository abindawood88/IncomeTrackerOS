"use client";

export default function WizardProgress({ step }: { step: number }) {
  return (
    <div className="mb-4 flex gap-2" aria-label="Wizard progress">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className={`h-2 flex-1 rounded-full ${n <= step ? "bg-gold" : "bg-bg-3"}`}
        />
      ))}
    </div>
  );
}
