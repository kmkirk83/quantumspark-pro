/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        quantumPurple: {
          light: '#a855f7',
          DEFAULT: '#7c3aed',
          dark: '#5b21b6',
        },
      },
    },
  },
  plugins: [],
}
