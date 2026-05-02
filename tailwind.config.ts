import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#07090f",
        surface: "#0d1117",
        "surface-2": "#141920",
        "surface-3": "#1a2030",
        border: "#1f2736",
        "border-light": "#2a3347",
        "text-primary": "#edf0f8",
        "text-secondary": "#9ba3bd",
        "text-muted": "#505a72",
        accent: "#6366f1",
        "accent-light": "#818cf8",
        "accent-hover": "#4f52e0",
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-accent": "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
        "gradient-card": "linear-gradient(145deg, #0d1117 0%, #141920 100%)",
      },
      boxShadow: {
        "accent-glow": "0 0 24px rgba(99,102,241,0.2)",
        card: "0 1px 2px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)",
        "card-hover": "0 4px 20px rgba(0,0,0,0.6), 0 12px 40px rgba(0,0,0,0.4)",
        modal: "0 8px 32px rgba(0,0,0,0.7), 0 32px 64px rgba(0,0,0,0.5)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
