/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue:          '#275EFE',
          'blue-light':  '#23C4F8',
          orange:        '#FF6B35',
          'orange-light':'#FF8C5A',
        },
      },
      // Smooth aspect ratio for category tiles (already in modern Tailwind, explicit here for clarity)
      aspectRatio: {
        square: '1 / 1',
      },
    },
  },
  plugins: [],
}
