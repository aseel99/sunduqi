/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['Tajawal', 'sans-serif'], // This enables font-arabic
      },
    },
  },
  plugins: [],
}
