/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  safelist: [
    'badge-pending',
    'badge-confirmed',
    'badge-processing',
    'badge-shipped',
    'badge-delivered',
    'badge-cancelled',
    'badge-unpaid',
    'badge-paid',
    'badge-overdue',
    'card-hover',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ── TEAL (Primary) - Trust, Movement, Logistics Flow ─────────
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6', // Main brand color
          600: '#0D9488', // Hover states
          700: '#0F766E', // Deep
          800: '#115E59',
          900: '#134E4A', // Darkest - text
          950: '#042F2E',
        },
        // ── CORAL (Accent) - Energy, Urgency, Action ─────────────────
        coral: {
          50: '#FFF5F5',
          100: '#FFE5E5',
          200: '#FFCCCC',
          300: '#FFB0B0',
          400: '#FF8B7B',
          500: '#FF6B6B', // Main accent
          600: '#EE5A5A', // Hover
          700: '#DC4A4A',
          800: '#C73A3A',
          900: '#B02A2A',
        },
        // ── NEUTRAL WARM ─────────────────────────────────────────────
        neutral: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
          950: '#0C0A09',
        },
        // ── LEGACY (Keep for backward compatibility) ─────────────────
        primary: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          900: '#134E4A',
        },
        accent: { 500: '#FF6B6B', 600: '#EE5A5A' },
        success: { 50: '#f0fdf4', 500: '#22c55e', 600: '#16a34a' },
        danger: { 50: '#fef2f2', 500: '#ef4444', 600: '#dc2626' },
        warning: { 50: '#fffbeb', 500: '#f59e0b', 600: '#d97706' },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'teal-glow':
          'radial-gradient(circle at center, rgba(20,184,166,0.15) 0%, transparent 70%)',
        'coral-glow':
          'radial-gradient(circle at center, rgba(255,107,107,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        soft: '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
        teal: '0 10px 40px -10px rgba(20,184,166,0.3), 0 2px 8px rgba(20,184,166,0.2)',
        coral:
          '0 10px 40px -10px rgba(255,107,107,0.3), 0 2px 8px rgba(255,107,107,0.2)',
        glow: '0 0 30px rgba(20,184,166,0.4)',
        'inner-glow': 'inset 0 2px 10px rgba(20,184,166,0.1)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        float: 'float 20s ease-in-out infinite',
        'float-delayed': 'float 20s ease-in-out 10s infinite',
        'float-slow': 'float 30s ease-in-out infinite',
        'pulse-slow': 'pulse 8s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        shake: 'shake 0.5s ease-in-out',
        shimmer: 'shimmer 2.5s infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        blob: 'blob 7s infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -30px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-10px)' },
          '75%': { transform: 'translateX(10px)' },
        },
        pulseGlow: {
          '0%, 100%': {
            boxShadow:
              '0 0 20px rgba(20,184,166,0.4), 0 0 40px rgba(20,184,166,0.2)',
          },
          '50%': {
            boxShadow:
              '0 0 30px rgba(20,184,166,0.6), 0 0 60px rgba(20,184,166,0.3)',
          },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(40px, -50px) scale(1.15)' },
          '66%': { transform: 'translate(-30px, 30px) scale(0.9)' },
        },
      },
    },
  },
  plugins: [],
}
