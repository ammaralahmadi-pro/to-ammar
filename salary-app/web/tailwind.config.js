/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ثيم Sunset Boulevard (theme-factory) — برتقالي محروق / مرجاني / رملي دافئ على خلفية داكنة
        primary: '#e76f51',
        primarydark: '#c9573c',
        accent: '#f4a261',
        sand: '#e9c46a',
        success: '#22c55e',
        warning: '#e9c46a',
        danger: '#ef4444',
        surface: '#171310',
        surface2: '#211a15',
        muted: '#0c0a08',
        gray: {
          50: '#1c1611',
          100: '#241d17',
          200: '#332821',
          300: '#544233',
          400: '#7d6a58',
          500: '#9c8a78',
          600: '#b8a897',
          700: '#d1c4b6',
          800: '#e7ddd2',
          900: '#f9f5f0',
        },
      },
      fontFamily: {
        display: ['var(--font-cairo)', 'Tahoma', 'sans-serif'],
        body: ['var(--font-cairo)', 'Tahoma', 'sans-serif'],
      },
      boxShadow: {
        card: '0 0 0 1px rgba(255,255,255,.06), 0 12px 30px -14px rgba(0,0,0,.7)',
        glow: '0 0 24px -6px rgba(231,111,81,.45)',
      },
    },
  },
  plugins: [],
};
