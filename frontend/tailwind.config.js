/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        romantic: {
          blush: '#FADADD',
          lavender: '#E8DAEF', 
          peach: '#FFF0E0',
          sky: '#D6ECFF',
          rose: '#F8BBD9',
          mint: '#E8F5E8'
        }
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'nunito': ['Nunito', 'sans-serif']
      },
      animation: {
        'heart-pulse': 'heart-pulse 1.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'gentle-bounce': 'gentle-bounce 2s ease-in-out infinite'
      },
      keyframes: {
        'heart-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'gentle-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        }
      }
    },
  },
  plugins: [],
};