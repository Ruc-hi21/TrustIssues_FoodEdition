/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0a",
        surface: "#1a1a2e",
        card: "#16213e",
        accent: "#e94560",
        accentSecondary: "#f5a623",
        textPrimary: "#ffffff",
        textMuted: "#9ca3af",
        borderDark: "#2a2a3e",
        safe: "#2e7d32",
        caution: "#f57f17",
        danger: "#c62828",
      },
    },
  },
  plugins: [],
};