/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
    "./styles/**/*.{js,jsx,ts,tsx,css}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#f97316",
        },
      },
    },
  },
  safelist: [
    "bg-orange-500/15",
    "text-orange-300",
    "ring-orange-400/30",
    "bg-blue-500/15",
    "text-blue-300",
    "ring-blue-400/30",
    "bg-green-500/15",
    "text-green-300",
    "ring-green-400/30",
    "bg-purple-500/15",
    "text-purple-300",
    "ring-purple-400/30",
    "bg-yellow-500/15",
    "text-yellow-200",
    "ring-yellow-400/30",
  ],
  plugins: [],
};
