import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: "#060b12", 1: "#0a1220", 2: "#0f1a2e", 3: "#152038" },
        gold: { DEFAULT: "#c9a227", light: "#f0c842", dim: "rgba(201,162,39,0.12)" },
        teal: { DEFAULT: "#00b4a0", light: "#00d4be", dim: "rgba(0,180,160,0.1)" },
        purple: { DEFAULT: "#9b6dff", light: "#c4a0ff", dim: "rgba(155,109,255,0.1)" },
        danger: "#e05252",
        muted: "#4a6080",
        textDim: "#c8ddf0",
        textBright: "#e8f4ff",
        border: "rgba(255,255,255,0.07)",
      },
      fontFamily: {
        serif: ["DM Serif Display", "serif"],
        mono: ["DM Mono", "monospace"],
        sans: ["Inter", "sans-serif"],
      },
      backdropBlur: { glass: "24px" },
      keyframes: {
        fadeSlideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fadeSlideUp 0.45s ease both",
        "spin-slow": "spin 0.7s linear infinite",
        "pulse-dot": "pulse 1s ease-in-out infinite",
      },
    },
  },
};

export default config;
