/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Existing dashboard tokens
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        slate: {
          850: '#151e2e',
          900: '#0f172a',
          950: '#090d16',
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
      },
    },
  },
  plugins: [],
}
