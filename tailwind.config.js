/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: '#FAF9F6',
        slate: '#111111',
        boundary: '#DCDCD4',
        emerald: '#2F8F7D'
      }
    }
  },
  plugins: []
}
