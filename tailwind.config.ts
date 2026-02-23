import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#F59E0B',
          dark: '#0A0A0F',
          surface: '#12121A',
          card: '#1A1A28',
          border: '#2A2A3A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        gold: '0 0 30px rgba(245,158,11,0.2)',
        'gold-sm': '0 0 12px rgba(245,158,11,0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
