/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-out': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-in': 'slide-in 300ms ease-out',
        'slide-out': 'slide-out 200ms ease-out',
        'fade-in': 'fade-in 200ms ease-out',
      },
      colors: {
        primary: { DEFAULT: '#8B5CF6', hover: '#7C3AED', light: '#DDD6FE' },
        accent: { DEFAULT: '#F472B6', hover: '#EC4899' },
        surface: { DEFAULT: '#FFFFFF', secondary: '#FDF4FF' },
      },
      fontFamily: {
        heading: ['Fredoka', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
      },
      fontSize: {
        hero: ['44px', { lineHeight: '1.12', letterSpacing: '-0.01em' }],
        h1: ['34px', { lineHeight: '1.18' }],
        h2: ['26px', { lineHeight: '1.2' }],
        h3: ['22px', { lineHeight: '1.3' }],
        subtitle: ['18px', { lineHeight: '1.4' }],
        body: ['17px', { lineHeight: '1.55' }],
        'body-sm': ['15px', { lineHeight: '1.5' }],
        caption: ['14px', { lineHeight: '1.4', letterSpacing: '0.02em' }],
        badge: ['13px', { lineHeight: '1.3', letterSpacing: '0.03em' }],
        button: ['17px', { lineHeight: '1' }],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.10)',
        elevated: '0 8px 24px rgba(0,0,0,0.12)',
        toast: '0 12px 28px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
}
