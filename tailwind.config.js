/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        night: { 900: '#140f2d', 800: '#1e1745', 700: '#2a2160', 600: '#3a2d80' },
        gold: { 300: '#fde68a', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
      },
      keyframes: {
        twinkle: { '0%,100%': { opacity: '0.2' }, '50%': { opacity: '1' } },
        blink: { '0%,92%,100%': { transform: 'scaleY(1)' }, '96%': { transform: 'scaleY(0.1)' } },
      },
      animation: {
        twinkle: 'twinkle 3s ease-in-out infinite',
        blink: 'blink 4s infinite',
      },
    },
  },
  plugins: [],
};
