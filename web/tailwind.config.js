/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        apricot: '#ffa369',   // Primary — أزرار، هيدر، عناصر بارزة
        glaze: '#fee7d9',     // درجة مساعدة — خلفيات هادئة وتمييز خفيف
        warmyellow: '#fdb940', // درجة مساعدة — تنبيهات وتمييز لوني
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
