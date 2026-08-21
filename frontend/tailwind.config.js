/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Platform Core Tokens
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
          electric: '#ff5722',
        },
        slate: {
          850: '#131b2e',
          900: '#0f172a',
          925: '#0b1120',
          950: '#070b14',
          975: '#04070d',
        },
        // Landing page / Zapier-inspired tokens
        orange: {
          DEFAULT: '#ff4f00',
          hover:   '#e64500',
          light:   '#fff2ec',
          subtle:  'rgba(255,79,0,0.08)',
        },
        cream: {
          DEFAULT: '#F7F5F0',
          soft:    '#EFECEA',
          border:  '#E0DDD6',
        },
        ink: {
          DEFAULT: '#1A1012',
          soft:    '#2A1F20',
          mid:     '#3D3030',
          body:    '#5C5050',
          muted:   '#9A8E8E',
        },
      },
      boxShadow: {
        'glow-brand': '0 0 25px -5px rgba(249, 115, 22, 0.35)',
        'glow-indigo': '0 0 25px -5px rgba(99, 102, 241, 0.35)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'inner-glow': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-up':    'fadeUp 0.6s ease both',
        'fade-in':    'fadeIn 0.5s ease both',
        'slide-left': 'slideLeft 0.65s ease both',
        'slide-right':'slideRight 0.65s ease both',
        'marquee':    'marquee 28s linear infinite',
        'node-pulse': 'nodePulse 2s ease-in-out infinite',
        'dash-flow':  'dashFlow 1.5s linear infinite',
        'counter':    'counterFadeUp 0.4s ease both',
        'float':      'float 4s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow':  'spin 8s linear infinite',
        'shimmer':    'shimmer 2.5s infinite',
      },
      keyframes: {
        fadeUp:    { from: { opacity: '0', transform: 'translateY(28px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideLeft: { from: { opacity: '0', transform: 'translateX(-40px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        slideRight:{ from: { opacity: '0', transform: 'translateX(40px)' },  to: { opacity: '1', transform: 'translateX(0)' } },
        marquee:   { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        nodePulse: { '0%,100%': { boxShadow: '0 0 0 0 rgba(255,79,0,0.4)' }, '50%': { boxShadow: '0 0 0 10px rgba(255,79,0,0)' } },
        dashFlow:  { from: { strokeDashoffset: '20' }, to: { strokeDashoffset: '0' } },
        counterFadeUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        float:     { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
}
