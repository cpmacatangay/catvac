/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#8B5CF6', hover: '#7C3AED', light: '#DDD6FE' },
        accent: { DEFAULT: '#F472B6', hover: '#EC4899' },
        surface: { DEFAULT: '#FFFFFF', secondary: '#FDF4FF' },
      },
      fontFamily: {
        heading: ['Fredoka', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.10)',
        elevated: '0 8px 24px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
