import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        ink: {
          950: '#0a0e16',
          900: '#0f1420',
          850: '#151b29',
          800: '#1b2334',
          700: '#26314a',
          600: '#36435f',
        },
        accent: {
          DEFAULT: '#1a65c2',
          soft: '#93c5fd',
          deep: '#1449a0',
        },
        sky2: '#0ea5e9',
        teal2: '#10b981',
        rose2: '#f43f5e',
        violet2: '#a78bfa',
      },
    },
  },
  plugins: [
    function ({ addUtilities }: any) {
      addUtilities({
        '.no-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      });
    },
  ],
};
export default config;
