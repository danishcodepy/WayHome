/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: 'rgb(var(--primary-rgb) / <alpha-value>)',
        primary: { DEFAULT: 'rgb(var(--primary-rgb) / <alpha-value>)', 50: 'rgb(var(--primary-soft-rgb) / <alpha-value>)', 100: '#DBEAFE', 600: 'rgb(var(--primary-hover-rgb) / <alpha-value>)', 700: '#123FA3' },
        navy: { DEFAULT: 'rgb(var(--navy-rgb) / <alpha-value>)', 900: 'rgb(var(--navy-rgb) / <alpha-value>)', 800: '#183454', 700: '#344F70' },
      },
      fontFamily: {
        display: ['Manrope', 'sans-serif'], // headings
        sans: ['Inter', 'sans-serif'], // body text
        head: ['Manrope', 'sans-serif'], // dashboard headings
      },
      boxShadow: { soft: '0 5px 20px #26341a09', card: '0 12px 32px #26341a12' },
    },
  },
  plugins: [],
};
