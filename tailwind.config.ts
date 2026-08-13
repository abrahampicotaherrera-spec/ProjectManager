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
          50: "#EEF6FC",
          100: "#D9EBF9",
          200: "#B3D7F3",
          300: "#82BDEA",
          400: "#4E9EDD",
          500: "#2C82C9",
          600: "#1E68AA",
          700: "#18538A",
          800: "#153F68",
          900: "#122E4C",
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
