/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        terminal: "0 24px 90px rgba(0, 0, 0, 0.42)",
        glow: "0 0 42px rgba(34, 211, 238, 0.16)",
      },
    },
  },
  plugins: [],
};
