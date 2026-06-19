/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        deep: '#090A1A',
        neon: '#8CE600',
        'neon-light': '#A3FF00',
        surface: '#12142D',
        border: '#22254F',
        muted: '#8888AA',
        canvas: '#FAF9F6',
        slate: '#111111',
        boundary: '#DCDCD4',
        emerald: '#2F8F7D'
      }
    }
  },
  plugins: []
}
