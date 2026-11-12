/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // "Build bench" palette: a machined-aluminium surface, graphite ink,
      // and anodized blue reserved for parts that are on the build.
      colors: {
        bench: {
          DEFAULT: "#E4E5E2",
          raised: "#EEEFEC",
          sunk: "#D7D9D5",
        },
        graphite: {
          DEFAULT: "#22262A",
          soft: "#4A5056",
        },
        steel: "#9AA0A6",
        anodized: {
          DEFAULT: "#2F5BEA",
          deep: "#2247C2",
          wash: "#DCE3FA",
        },
        heat: "#6B4FA0",
      },
      fontFamily: {
        sans: ["var(--font-archivo)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      // Classical scale (The Elements of Typographic Style).
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.3rem" }],
        base: ["1rem", { lineHeight: "1.55rem" }],
        lg: ["1.125rem", { lineHeight: "1.7rem" }],
        xl: ["1.3125rem", { lineHeight: "1.8rem" }],
        "2xl": ["1.5rem", { lineHeight: "1.9rem" }],
        "3xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "4xl": ["3rem", { lineHeight: "3.1rem" }],
        "5xl": ["3.75rem", { lineHeight: "3.8rem" }],
        "6xl": ["4.5rem", { lineHeight: "4.4rem" }],
      },
      borderRadius: {
        part: "3px",
        panel: "6px",
      },
    },
  },
  plugins: [],
};
