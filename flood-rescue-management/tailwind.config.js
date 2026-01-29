/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html", "./index.html"],
  theme: {
    extend: {
      colors: {
        "primary": "#1d9ec9",
        "primary-dark": "#063660",
        "secondary": "#E53935",
        "background-light": "#f1f2f4",
        "background-dark": "#1a1f23",
        "surface-light": "#ffffff",
        "surface-dark": "#2C3238",
        "surface-darker": "#1c2426",
        "border-dark": "#3d4d52",
        "text-secondary": "#9eb1b7",
        dark: {
          bg: "#1a1d29",
          card: "#252836",
          border: "#2d3142",
          hover: "#2d3447",
          text: {
            primary: "#ffffff",
            secondary: "#9ca3af",
            muted: "#6b7280",
          },
        },
        primary: {
          blue: "#3b82f6",
          blueHover: "#2563eb",
        },
        status: {
          online: "#10b981",
          offline: "#6b7280",
          pending: "#f59e0b",
        },
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"]
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 15px rgba(10, 75, 133, 0.15)',
      }
    },
  },
  plugins: [],
};
