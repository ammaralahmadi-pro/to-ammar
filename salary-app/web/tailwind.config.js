/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
        primarydark: '#4338ca',
        success: '#16a34a',
        warning: '#f59e0b',
        danger: '#dc2626',
        surface: '#ffffff',
        muted: '#f4f4f6',
      },
      fontFamily: {
        display: ['var(--font-cairo)', 'Tahoma', 'sans-serif'],
        body: ['var(--font-cairo)', 'Tahoma', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,.05), 0 8px 24px -12px rgba(0,0,0,.15)',
      },
    },
  },
  plugins: [],
};
