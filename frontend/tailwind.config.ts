import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#02182b",
        accent: "#09ffd3",
      },
      borderOpacity: {
        8: "0.08",
      },
    },
  },
  plugins: [],
};
export default config;
