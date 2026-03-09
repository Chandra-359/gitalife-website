/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: "#E8751A",
        teal: "#1A5C5E",
        gold: "#D4A843",
        cream: "#FFF9F0",
        surface: "#FFF3E0",
        charcoal: "#2D2D2D",
        warmgray: "#6B6B6B",
      },
      fontFamily: {
        serif: ["Playfair Display", "Lora", "Georgia", "serif"],
        sans: ["Inter", "Poppins", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
