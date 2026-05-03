/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        urban: {
          bg: '#0A0E1A',
          card: '#121826',
          border: '#1E2738',
          red: '#E11D2E',
          'red-hover': '#C81729',
          muted: '#8B93A7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Bebas Neue"', 'Inter', 'sans-serif']
      },
      boxShadow: {
        'glow-red': '0 0 40px -10px rgba(225, 29, 46, 0.5)',
        'glow-blue': '0 0 60px -10px rgba(59, 130, 246, 0.4)',
      },
      animation: {
        'fade-up': 'fadeUp 0.7s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    },
  },
  plugins: [],
}
