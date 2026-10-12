import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FDFBF7',
          100: '#FBF7ED',
          200: '#F5EBCF',
          300: '#EEDFB1',
          400: '#E1C775',
          500: '#D4AF37', // Brand Primary Gold
          600: '#C59B27',
          700: '#A37A17',
          800: '#7B5C12',
          900: '#523E0C',
        },
        emerald: {
          850: '#0F382A', // Brand Deep Luxury Emerald
          900: '#0B2A1F',
          950: '#061711',
        },
        cream: {
          50: '#FDFCF9',
          100: '#FAF8F2',
          200: '#F4EFE3',
          300: '#EDE4D1',
        },
      },
      fontFamily: {
        arabic: ['var(--font-cairo)', 'Cairo', 'Tajawal', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 4px 20px -2px rgba(212, 175, 55, 0.25)',
        luxury: '0 10px 30px -5px rgba(11, 42, 31, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;

