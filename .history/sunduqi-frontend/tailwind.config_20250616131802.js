/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        darkblue: '#01475b',       // اللون الأساسي للشريط الجانبي
        darkgray: '#1f2937',       // لون داكن للعناوين أو النصوص
        lightgray: '#f4f4f4',      // خلفية ناعمة
        bordergray: '#e5e7eb',     // حدود
        muted: '#9ca3af',          // نصوص ثانوية
        danger: '#ef4444',         // أحمر
        success: '#10b981',        // أخضر
        white: '#ffffff',
        black: '#000000',
      },
      fontFamily: {
        arabic: ['Tajawal', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.05), 0 4px 6px rgba(0,0,0,0.1)',
      },
      borderRadius: {
        xl: '1rem',
      },
    },
  },
  plugins: [],
};
