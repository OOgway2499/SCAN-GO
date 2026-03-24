// ── ScanGo Design Tokens ──
// Figma dark canvas × Stitch gradient mesh design system

export const colors = {
  bg: "#1E1E1E",
  surface: "#2C2C2C",
  elevated: "#383838",
  border: "rgba(255,255,255,0.09)",
  borderHi: "rgba(255,255,255,0.18)",

  primary: "#7B61FF",
  primaryLight: "#A78BFA",
  primaryDark: "#5B41DF",

  secondary: "#2DD4BF",
  pink: "#F472B6",

  warning: "#FBBF24",
  success: "#34D399",
  danger: "#F87171",
  info: "#388BFD",

  text1: "#F0F0F0",
  text2: "#A0A0A0",
  text3: "#606060",
} as const;

export const gradients = {
  primary: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
  primaryGlow: `0 0 30px ${colors.primary}44`,
  primaryGlowStrong: `0 0 40px ${colors.primary}55`,

  meshBg1: `radial-gradient(ellipse 80% 60% at 20% 10%, rgba(123,97,255,0.18) 0%, transparent 60%),
             radial-gradient(ellipse 60% 50% at 80% 80%, rgba(45,212,191,0.12) 0%, transparent 55%),
             radial-gradient(ellipse 50% 40% at 60% 30%, rgba(244,114,182,0.09) 0%, transparent 50%)`,

  meshBg2: `radial-gradient(ellipse 70% 60% at 10% 80%, rgba(123,97,255,0.15) 0%, transparent 55%),
             radial-gradient(ellipse 50% 50% at 85% 20%, rgba(251,191,36,0.10) 0%, transparent 50%)`,

  meshBg3: `radial-gradient(ellipse 90% 70% at 50% 0%, rgba(123,97,255,0.20) 0%, transparent 60%),
             radial-gradient(ellipse 60% 60% at 90% 90%, rgba(45,212,191,0.12) 0%, transparent 50%)`,

  dotGrid: `radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)`,
} as const;

export const typography = {
  displayFont: "'Plus Jakarta Sans', sans-serif",
  monoFont: "'JetBrains Mono', monospace",
  fontUrl: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap",
} as const;

export const animations = {
  pageTransition: "fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
  staggerDelay: 20, // ms per item
  toastDuration: 2400,
  confettiCount: 26,
} as const;

export const categories = [
  "All", "Staples", "Dairy", "Snacks", "Beverages",
  "Cooking", "Vegetables", "Fruits", "Personal Care",
  "Instant", "Household",
] as const;

export type Category = (typeof categories)[number];
