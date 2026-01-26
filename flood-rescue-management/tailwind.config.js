/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
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
    },
  },
  plugins: [],
};
