/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#0F52BA",
        "primary-dark": "#0A3D8F",
        "background-light": "#f6f7f8",
        "background-dark": "#1c1e22",
        "surface-light": "#ffffff",
        "surface-dark": "#1e293b",
        "surface-darker": "#0f172a",
        "sos-red": "#D32F2F",
        "relief-orange": "#F57C00",
        "status-green": "#2E7D32",
        "water-blue": "#2196F3",
        "border-dark": "#334155",
        "text-secondary": "#94a3b8",
      },
      fontFamily: {
        display: ["Inter", "Manrope", "sans-serif"],
      },
      animation: {
        'radar': 'radar 2s infinite ease-out',
        'float': 'float 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        radar: {
          '0%': { transform: 'scale(0)', opacity: '0.8' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
