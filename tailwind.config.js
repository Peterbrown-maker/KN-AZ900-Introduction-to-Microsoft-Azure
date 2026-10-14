/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        azure: {
          50: '#e8f4fc',
          100: '#d0e9f9',
          200: '#a6d3f3',
          300: '#6fb8eb',
          400: '#3a9ede',
          500: '#0078d4',
          600: '#006abd',
          700: '#005294',
          800: '#003f70',
          900: '#002a4d',
          950: '#001529',
        },
        midnight: {
          50: '#e8edf5',
          100: '#cad6e8',
          200: '#94accf',
          300: '#5f81b6',
          400: '#3a5f97',
          500: '#243f6f',
          600: '#1a2f57',
          700: '#152447',
          800: '#0f1a35',
          900: '#0a1126',
          950: '#050a17',
        },
        cyan: {
          glow: '#22d3ee',
        },
        semantic: {
          identity: '#8b5cf6',
          success: '#22c55e',
          warning: '#f59e0b',
          danger: '#ef4444',
          info: '#0078d4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'data-flow': 'dataFlow 2s linear infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 8px rgba(0,120,212,0.3)' },
          '100%': { boxShadow: '0 0 24px rgba(0,120,212,0.6)' },
        },
        dataFlow: {
          '0%': { strokeDashoffset: '40' },
          '100%': { strokeDashoffset: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
