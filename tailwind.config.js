/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3f8cff',
          strong: '#5f9cff',
          soft: 'rgba(80, 140, 255, 0.2)',
        },
        background: {
          main: 'radial-gradient(circle at top, #2836ff 0, #050816 52%, #020310 100%)',
          card: 'rgba(8, 15, 40, 0.92)',
          soft: 'rgba(19, 32, 76, 0.86)',
        },
        text: {
          main: '#f5f7ff',
          muted: '#9aa8d8',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.06)',
          strong: 'rgba(123, 196, 255, 0.6)',
        },
        accent: '#3f8cff',
        danger: '#ff5f7a',
        success: '#3ed2a8',
        gold: '#ffd66b',
      },
      borderRadius: {
        lg: '24px',
        md: '18px',
        pill: '999px',
      },
      boxShadow: {
        soft: '0 20px 40px rgba(0, 0, 0, 0.65)',
        strong: '0 30px 80px rgba(0, 0, 0, 0.8)',
      },
      blur: {
        strong: '26px',
      },
      transitionDuration: {
        fast: '150ms',
        med: '220ms',
      },
    },
  },
  plugins: [],
}
