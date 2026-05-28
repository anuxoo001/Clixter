/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        glass: '0 18px 70px rgba(15, 23, 42, 0.18)',
      },
      backgroundImage: {
        'page-glow': 'radial-gradient(circle at top left, rgba(56, 189, 248, 0.18), transparent 24%), radial-gradient(circle at bottom right, rgba(236, 72, 153, 0.16), transparent 20%)',
      },
    },
  },
  plugins: [],
}