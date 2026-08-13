import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B1120",
          900: "#111A2E",
          800: "#1B2740",
        },
        slate: {
          50: "#F6F7FA",
        },
        brand: {
          50: "#EFF8F7",
          100: "#D7EEEB",
          200: "#AEDDD7",
          300: "#7BC5BC",
          400: "#45A69A",
          500: "#1F8A7C",
          600: "#136F64",
          700: "#0F5850",
          800: "#0C433D",
          900: "#082E2A",
        },
        clay: {
          400: "#E1A15C",
          500: "#D48A3C",
        },
        rust: {
          400: "#D9704F",
          500: "#C55A3A",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,17,32,0.06), 0 1px 8px rgba(11,17,32,0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
