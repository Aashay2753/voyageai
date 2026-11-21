import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-bg-primary)",
        secondary: "var(--color-bg-secondary)",
        accent: "var(--color-accent)",
        "accent-light": "var(--color-accent-light)",
        "accent-dark": "var(--color-accent-dark)",
        "text-main": "var(--color-text-main)",
        "text-muted": "var(--color-text-muted)",
        "border-theme": "var(--color-border)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "SF Pro Display", "system-ui", "sans-serif"],
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 20s linear infinite",
        "gradient": "gradient 8s ease infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-gradient": "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
