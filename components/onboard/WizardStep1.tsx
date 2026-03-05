"use client";

export default function WizardStep1({ targetIncome, setTargetIncome, capital, setCapital }: { targetIncome: number; setTargetIncome: (n: number) => void; capital: number; setCapital: (n: number) => void; }) {
  return <div className="space-y-3"><input data-testid="step1-target" type="number" value={targetIncome} onChange={(e)=>setTargetIncome(Number(e.target.value)||0)} className="w-full rounded border border-border bg-bg-2 px-3 py-2" /><input data-testid="step1-capital" type="number" value={capital} onChange={(e)=>setCapital(Number(e.target.value)||0)} className="w-full rounded border border-border bg-bg-2 px-3 py-2" /></div>;
}
