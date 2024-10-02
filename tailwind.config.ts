import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "selector",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      height: {
        viewportStable: "var(--tg-viewport-stable-height)",
        viewport: "var(--tg-viewport-height)",
      },
      minHeight: {
        viewportStable: "var(--tg-viewport-stable-height)",
        viewport: "var(--tg-viewport-height)",
      },
      maxHeight: {
        viewportStable: "var(--tg-viewport-stable-height)",
        viewport: "var(--tg-viewport-height)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        "positive-1": "hsl(var(--positive-1))",
        "positive-2": "hsl(var(--positive-2))",
        "negative-1": "hsl(var(--negative-1))",
        "negative-2": "hsl(var(--negative-2))",
        negative: {
          DEFAULT: "hsl(var(--negative))",
          foreground: "hsl(var(--negative-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        flip: {
          "0%": { transform: "rotateY(0deg)" },
          "25%": { transform: "rotateY(180deg)" },
          "50%": { transform: "rotateY(360deg)" },
          "100%": { transform: "rotateY(360deg)" },
        },
      },
      animation: {
        flip: "flip 10s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
