import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand color - Zepzo purple, anchored on #930dca
        brand: {
          50: "#faf0fe",
          100: "#f4ddfe",
          200: "#e7b7fa",
          300: "#d582f7",
          400: "#be3ff3",
          500: "#a70fe6",
          600: "#930dca",
          700: "#71079d",
          800: "#560477",
          900: "#3d0354",
        },
        // Accent color - used ONLY for high-conversion CTAs (checkout, pay, buy)
        accent: {
          400: "#ff9640",
          500: "#ff7a00",
          600: "#e56d00",
          700: "#cc6100",
        },
      },
      borderRadius: {
        card: "20px",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 4px 24px rgba(147, 13, 202, 0.08)",
        "soft-lg": "0 12px 40px rgba(147, 13, 202, 0.14)",
        glow: "0 0 0 4px rgba(147, 13, 202, 0.12)",
      },
      transitionDuration: {
        250: "250ms",
      },
    },
  },
  plugins: [],
};
export default config;
