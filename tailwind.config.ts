import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#eefbfa',
          100: '#d4f3f0',
          200: '#ade6e1',
          300: '#7bd2cc',
          400: '#48b6b0',
          500: '#2c9a95',
          600: '#217c79',
          700: '#1f6462',
          800: '#0f3d3d', // teal-800 primary
          900: '#0a2b2c', // teal-900 primary
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f5a623', // amber-500 accent
          600: '#d98a0f',
          700: '#b3690b',
        },
        rose: {
          50: '#fff1f2',
          100: '#ffe1e3',
          400: '#fb7185',
          500: '#e94560', // expenses
          600: '#c22a45',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          400: '#34d399',
          500: '#0f9d70', // income
          600: '#0b7e59',
        },
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        mono: ['var(--font-plex-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 61 61 / 0.06), 0 1px 3px 0 rgb(15 61 61 / 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
