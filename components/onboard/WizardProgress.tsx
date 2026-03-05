"use client";

export default function WizardProgress({ step }: { step: number }) {
  return <div className="text-sm text-textDim">Step {step} of 3</div>;
}
