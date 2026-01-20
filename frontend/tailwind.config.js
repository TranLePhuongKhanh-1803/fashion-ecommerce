/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          black: '#1a1a1a',
          white: '#ffffff',
          beige: '#f5f5f0',
          gold: '#d4af37',
          gray: '#2d2d2d',
          'gray-light': '#f8f8f8',
        }
      },
    },
  },
  plugins: [],
}
