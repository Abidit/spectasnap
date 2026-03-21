import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Clean Build tokens (cream / ink / gold) ──────────────────
        'cream-50':  '#FDFAF4',
        'cream-100': '#F5F0E8',
        'cream-200': '#EDE8DC',
        'cream-400': '#DDD8CE',
        'ink-900':   '#1A1612',
        'ink-500':   '#6B6560',
        'ink-300':   '#9A9490',
        'gold-500':  '#C9A96E',
        'gold-600':  '#A8844A',
        'gold-100':  '#F7EDD8',
        'dark':      '#0A0A0A',
        // ── Legacy brand tokens (kept for backward compat) ───────────
        brand: {
          page:      '#F5F0E8',
          panel:     '#FDFAF4',
          secondary: '#EDE8DC',
          text:      '#1A1612',
          muted:     '#6B6560',
          gold:      '#C9A96E',
          'gold-dk': '#A8844A',
          border:    '#DDD8CE',
          camera:    '#0A0A0A',
          overlay:   'rgba(10,10,10,0.72)',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sharp: '2px',
        panel: '6px',
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
