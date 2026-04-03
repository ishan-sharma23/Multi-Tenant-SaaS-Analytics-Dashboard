import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Manrope", "sans-serif"],
      },
      colors: {
        canvas: "#f5f7ef",
        ink: "#0f172a",
        signal: "#ff6b00",
        ocean: "#0d9488",
        berry: "#be123c",
      },
      boxShadow: {
        panel: "0 18px 40px -24px rgba(15, 23, 42, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
