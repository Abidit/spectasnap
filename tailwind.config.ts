import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // Light UI palette
          page:      '#F5F0E8',
          panel:     '#FDFAF4',
          secondary: '#EDE8DC',
          text:      '#1A1612',
          muted:     '#6B6560',
          gold:      '#C9A96E',
          'gold-dk': '#A8844A',
          border:    '#DDD8CE',
          // Camera viewport (stays dark)
          camera:    '#0A0A0A',
          // Selector overlay on camera
          overlay:   'rgba(10,10,10,0.72)',
        },
      },
      fontFamily: {
        serif:   ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sharp: '2px',
      },
      boxShadow: {
        gold: '0 0 24px rgba(201,169,110,0.18)',
        soft: '0 2px 16px rgba(26,22,18,0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
