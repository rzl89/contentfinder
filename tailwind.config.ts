import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', 'JetBrains Mono', 'monospace'],
      },
      colors: {
        obsidian: '#09090b',
        card: '#111115',
        'card-alt': '#16161c',
        field: '#0c0c10',
        surface: '#1c1c22',
        amber: {
          DEFAULT: '#f59e0b',
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        emerald: {
          DEFAULT: '#10b981',
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
      },
      borderRadius: {
        bento: '1.15rem',
      },
      boxShadow: {
        bento: '0 14px 36px -14px rgba(0, 0, 0, 0.75)',
        'bento-hover': '0 20px 40px -12px rgba(0, 0, 0, 0.85)',
      },
      animation: {
        'pulse-slow': 'subtlePulse 2.2s infinite ease-in-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        subtlePulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
