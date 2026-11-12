import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F4E8D8",
        terracotta: {
          DEFAULT: "#A9532F",
          dark: "#8A3F20",
        },
        brown: "#5C3119",
        olive: "#6F6A4E",
        blush: "#D9C2B4",
        espresso: "#4A2614",
        ink: "#3B2416",
        "body-muted": "#5A3B2A",
        card: "#FFFBF5",
        line: "#E3D2BF",
        "input-border": "#CDB7A2",
      },
      fontFamily: {
        display: ["var(--font-dm-serif)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "1240px",
      },
    },
  },
  plugins: [],
};

export default config;
