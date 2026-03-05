"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import LivePreviewPane from "@/components/onboard/LivePreviewPane";
import WizardProgress from "@/components/onboard/WizardProgress";
import WizardStep1 from "@/components/onboard/WizardStep1";
import WizardStep2 from "@/components/onboard/WizardStep2";
import WizardStep3 from "@/components/onboard/WizardStep3";
import { project, findFreedomYear } from "@/lib/engine";
import { useDFPStore } from "@/lib/store";

export default function OnboardPage() {
  const router = useRouter();
  const setGoal = useDFPStore((s) => s.setGoal);
  const completeOnboarding = useDFPStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(1);
  const [targetIncome, setTargetIncome] = useState(5000);
  const [capital, setCapital] = useState(50000);
  const [strategy, setStrategy] = useState<"income" | "growth" | "hyper">("income");
  const [recommendedMix, setRecommendedMix] = useState(true);

  const rows = useMemo(() => project({ capital, monthly: 2000, cagr: 0.08, yld: 0.06, drip: true, years: 30, crash: 0, pause: 0 }), [capital]);
  const monthlyIncome = rows[rows.length - 1]?.monthly ?? 0;
  const freedomDate = findFreedomYear(rows, targetIncome);
  const freedomScore = Math.min(100, Math.round((monthlyIncome / Math.max(targetIncome, 1)) * 100));

  function finish() {
    setGoal({ targetIncome, capital, strategy, hasSetCapital: true });
    completeOnboarding();
    router.push("/dashboard/overview");
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-6 p-6 md:grid-cols-2">
      <section className="space-y-4">
        <WizardProgress step={step} />
        {step === 1 ? <WizardStep1 targetIncome={targetIncome} setTargetIncome={setTargetIncome} capital={capital} setCapital={setCapital} /> : null}
        {step === 2 ? <WizardStep2 strategy={strategy} setStrategy={setStrategy} /> : null}
        {step === 3 ? <WizardStep3 recommendedMix={recommendedMix} setRecommendedMix={setRecommendedMix} /> : null}
        <div className="flex gap-2">
          <button data-testid="onboard-back" disabled={step === 1} onClick={() => setStep((s) => Math.max(1, s - 1))} className="rounded border border-border px-3 py-2 disabled:opacity-50">Back</button>
          {step < 3 ? <button data-testid="onboard-next" onClick={() => setStep((s) => Math.min(3, s + 1))} className="rounded bg-gold px-3 py-2 text-bg">Next</button> : <button data-testid="onboard-finish" onClick={finish} className="rounded bg-teal px-3 py-2 text-bg">Finish</button>}
        </div>
      </section>
      <LivePreviewPane monthlyIncome={monthlyIncome} freedomScore={freedomScore} freedomDate={freedomDate} />
    </main>
  );
}
