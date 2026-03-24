/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#1E1E1E',
        surface: '#2C2C2C',
        elevated: '#383838',
        'border-subtle': 'rgba(255,255,255,0.09)',
        'border-hi': 'rgba(255,255,255,0.18)',
        primary: '#7B61FF',
        'primary-light': '#A78BFA',
        'primary-dark': '#5B41DF',
        secondary: '#2DD4BF',
        pink: '#F472B6',
        warning: '#FBBF24',
        success: '#34D399',
        danger: '#F87171',
        info: '#388BFD',
        't1': '#F0F0F0',
        't2': '#A0A0A0',
        't3': '#606060',
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", 'sans-serif'],
        mono: ["'JetBrains Mono'", 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        'pop-in': 'popIn 0.4s ease',
        'toast-in': 'toastIn 0.25s ease',
        'spin-slow': 'spin 0.8s linear infinite',
        'confetti': 'confetti 1s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        toastIn: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(110px) rotate(720deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
