"use client";

export default function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full border transition ${
          checked ? "border-gold bg-gold-dim" : "border-border bg-bg-3"
        }`}
      >
        <span
          className={`absolute top-0.5 h-[18px] w-[18px] rounded-full bg-textBright transition ${
            checked ? "left-5" : "left-0.5"
          }`}
        />
      </button>
      <span className="text-sm text-textDim">{label}</span>
    </label>
  );
}
