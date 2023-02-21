/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        '-2xl': {max: '1536px'},
        '-xl': {max: '1280px'},
        '-lg': {max: '1024px'},
        '-md': {max: '768px'},
        '-sm': {max: '640px'},
      }
    },
  },
  plugins: [],
}