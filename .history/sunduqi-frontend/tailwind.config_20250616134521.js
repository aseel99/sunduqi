/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2D3E50',
        lightgray: '#F5F6FA',
        darkgray: '#1C1C1C',
        lightText: '#8A8A8A',
        borderGray: '#E0E0E0',
        danger: '#ef4444',
        success: '#10b981',
        white: '#ffffff',
        black: '#000000',
      },
      fontFamily: {
        arabic: ['Tajawal', 'sans-serif'],
      },
      borderRadius: {
        md: '8px',
        lg: '12px',
      },
    },
  },
  plugins: [],
};
