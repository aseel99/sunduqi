/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F5C700',         // الأصفر المميز لشعار eshalabi
        secondary: '#333333',       // رمادي داكن للنصوص
        accent: '#E5B600',          // لون أصفر أغمق للـ hover
        graylight: '#F9FAFB',       // خلفية ناعمة جداً
        bordergray: '#E5E7EB',      // لون للحدود والفواصل
        muted: '#9CA3AF',           // رمادي للنصوص الثانوية
        danger: '#EF4444',          // أحمر للتنبيهات
        success: '#10B981',         // أخضر للحالات الناجحة
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
}
