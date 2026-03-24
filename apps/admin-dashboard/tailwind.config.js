/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#121212',
        surface: '#1E1E1E',
        elevated: '#2A2A2A',
        'border-subtle': 'rgba(255,255,255,0.08)',
        'border-hi': 'rgba(255,255,255,0.15)',
        primary: '#7B61FF',
        'primary-light': '#A78BFA',
        secondary: '#2DD4BF',
        warning: '#FBBF24',
        success: '#34D399',
        danger: '#F87171',
        t1: '#FFFFFF',
        t2: '#A1A1AA',
        t3: '#71717A',
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", 'sans-serif'],
        mono: ["'JetBrains Mono'", 'monospace'],
      },
    },
  },
  plugins: [],
};
