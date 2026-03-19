/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Core palette (đồng nhất theo design system)
        primary: "#2563EB",
        "primary-dark": "#1D4ED8",
        "primary-light": "#EFF6FF",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        "background-light": "#F8FAFC",
        "background-dark": "#1c1e22",
        "surface-light": "#FFFFFF",
        "surface-dark": "#1e293b",
        "surface-darker": "#0f172a",
        // Backward-compatible aliases
        "sos-red": "#EF4444",
        "relief-orange": "#F59E0B",
        "status-green": "#22C55E",
        "water-blue": "#3B82F6",
        "border-dark": "#334155",
        "text-secondary": "#94a3b8",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", ...defaultTheme.fontFamily.sans],
        display: ["Plus Jakarta Sans", ...defaultTheme.fontFamily.sans],
      },
      animation: {
        radar: "radar 2s infinite ease-out",
        float: "float 4s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        radar: {
          "0%": { transform: "scale(0)", opacity: "0.8" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
