/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#8b5cf6',
        primarydark: '#7c3aed',
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
        surface: '#0d1017',
        surface2: '#151926',
        muted: '#030406',
        gray: {
          50: '#12151f',
          100: '#191d2a',
          200: '#252a3b',
          300: '#42475d',
          400: '#666b82',
          500: '#84899e',
          600: '#a3a7ba',
          700: '#c1c4d3',
          800: '#dfe1ea',
          900: '#f6f6fa',
        },
      },
      fontFamily: {
        display: ['var(--font-cairo)', 'Tahoma', 'sans-serif'],
        body: ['var(--font-cairo)', 'Tahoma', 'sans-serif'],
      },
      boxShadow: {
        card: '0 0 0 1px rgba(255,255,255,.06), 0 12px 30px -14px rgba(0,0,0,.7)',
        glow: '0 0 24px -6px rgba(139,92,246,.45)',
      },
    },
  },
  plugins: [],
};
