/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        primarydark: '#2563eb',
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
        surface: '#111528',
        surface2: '#171c33',
        muted: '#05070d',
        gray: {
          50: '#141828',
          100: '#1c2137',
          200: '#282e49',
          300: '#454c6b',
          400: '#6b7290',
          500: '#8890ab',
          600: '#a7adc4',
          700: '#c4c9db',
          800: '#e1e4ee',
          900: '#f4f5fa',
        },
      },
      fontFamily: {
        display: ['var(--font-cairo)', 'Tahoma', 'sans-serif'],
        body: ['var(--font-cairo)', 'Tahoma', 'sans-serif'],
      },
      boxShadow: {
        card: '0 0 0 1px rgba(255,255,255,.06), 0 12px 30px -14px rgba(0,0,0,.7)',
        glow: '0 0 24px -4px rgba(59,130,246,.5)',
      },
    },
  },
  plugins: [],
};
