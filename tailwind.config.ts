import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand color - premium purple
        brand: {
          50: "#f5f1ff",
          100: "#ede4ff",
          200: "#dccbff",
          300: "#c2a4ff",
          400: "#a674ff",
          500: "#8a47ff",
          600: "#6e3bff",
          700: "#5c2ce0",
          800: "#4a24b3",
          900: "#3d1f8f",
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
        soft: "0 4px 24px rgba(110, 59, 255, 0.08)",
        "soft-lg": "0 12px 40px rgba(110, 59, 255, 0.14)",
        glow: "0 0 0 4px rgba(110, 59, 255, 0.12)",
      },
      transitionDuration: {
        250: "250ms",
      },
    },
  },
  plugins: [],
};
export default config;
