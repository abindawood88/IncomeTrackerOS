"use client";

export default function WizardStep3({ recommendedMix, setRecommendedMix }: { recommendedMix: boolean; setRecommendedMix: (v:boolean)=>void }) {
  return <label className="flex items-center gap-2"><input type="checkbox" checked={recommendedMix} onChange={(e)=>setRecommendedMix(e.target.checked)} />Use recommended mix</label>;
}
