/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.js'],
  theme: {
    extend: {
      colors: {
        digital: {
          bg: '#0d0d2b',
          neon: '#00f5ff',
          accent: '#ff00ff',
          glow: '#7b2fff'
        },
        real: {
          bg: '#fdf6ec',
          warm: '#f4a261',
          nature: '#52b788',
          fade: '#adb5bd'
        }
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        ui: ['"Nunito"', 'sans-serif']
      }
    }
  },
  plugins: []
};
