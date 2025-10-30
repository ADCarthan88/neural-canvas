/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neural: {
          primary: '#ff006e',
          secondary: '#8338ec',
          accent: '#3a86ff',
          quantum: '#00ffff',
          liquid: '#ff4081',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #ff006e, 0 0 10px #ff006e, 0 0 15px #ff006e' },
          '100%': { boxShadow: '0 0 10px #8338ec, 0 0 20px #8338ec, 0 0 30px #8338ec' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}