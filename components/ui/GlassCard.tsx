import type { CSSProperties, ReactNode } from "react";
import clsx from "clsx";

export default function GlassCard({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <section
      className={clsx(
        "rounded-2xl border border-border bg-bg-2/70 p-4 backdrop-blur-glass",
        className,
      )}
      style={style}
    >
      {children}
    </section>
  );
}
