/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Bebas Neue', 'Impact', 'sans-serif'],
      },
      colors: {
        timer: {
          bg: '#0a0a0f',
          face: '#12121a',
          ring: '#1a1a25',
          sector: '#4ade80',
          sectorGlow: '#86efac',
          accent: '#00d9ff',
          text: '#e8e8ec',
          muted: '#5a5a6e',
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 20px rgba(74, 222, 128, 0.4))' },
          '50%': { filter: 'drop-shadow(0 0 40px rgba(74, 222, 128, 0.8))' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
