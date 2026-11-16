/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        canvas: "#F8FAFC",
        panel: "#FFFFFF",
        blood: "#C62828",
        accent: "#C62828",
        "soft-red": "#FEE2E2",
        line: "#E2E8F0",
        muted: "#64748B",
        rose: "#FEE2E2",
      },
      fontFamily: {
        sans: ["DM Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 20px 55px rgba(198, 40, 40, 0.16)",
        card: "0 10px 30px rgba(23, 32, 51, 0.05)",
      },
    },
  },
  plugins: [],
};
