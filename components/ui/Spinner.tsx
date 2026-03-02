"use client";

import clsx from "clsx";

export default function Spinner({
  size = 16,
  color = "teal",
}: {
  size?: number;
  color?: "teal" | "gold" | "purple";
}) {
  return (
    <span
      className={clsx("inline-block rounded-full border-2 border-transparent animate-spin-slow", {
        "border-t-teal": color === "teal",
        "border-t-gold": color === "gold",
        "border-t-purple": color === "purple",
      })}
      style={{ width: size, height: size }}
      aria-label="loading"
    />
  );
}