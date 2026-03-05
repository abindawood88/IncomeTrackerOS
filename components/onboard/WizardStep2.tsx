"use client";

export default function WizardStep2({ strategy, setStrategy }: { strategy: "income"|"growth"|"hyper"; setStrategy: (s: "income"|"growth"|"hyper") => void; }) {
  return <div className="grid gap-2"><button data-testid="strategy-card-income" onClick={()=>setStrategy("income")} className="rounded border border-border p-3">Income-First</button><button data-testid="strategy-card-balanced" onClick={()=>setStrategy("growth")} className="rounded border border-border p-3">Balanced Growth</button><button data-testid="strategy-card-highyield" onClick={()=>setStrategy("hyper")} className="rounded border border-border p-3">High Yield</button><div className="text-xs text-textDim">Selected: {strategy}</div></div>;
}
