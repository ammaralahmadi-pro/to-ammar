/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        apricot: '#0a6bf5',   // Primary — أزرار، هيدر، عناصر بارزة (مستوحى من أنيميشن فقاعات المحادثة)
        glaze: '#e3edfe',     // درجة مساعدة — خلفيات هادئة وتمييز خفيف
        warmyellow: '#12b03a', // درجة مساعدة — تنبيهات وتمييز لوني (أخضر الفقاعة)
        ink: '#000000',
        paper: '#ffffff',
      },
      fontFamily: {
        display: ['var(--font-tajawal)', 'Tahoma', 'sans-serif'],
        body: ['var(--font-tajawal)', 'Tahoma', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,.05), 0 8px 24px -12px rgba(0,0,0,.15)',
      },
    },
  },
  plugins: [],
};
