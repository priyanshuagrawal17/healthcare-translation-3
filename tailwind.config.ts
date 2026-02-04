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
        doctor: { bg: '#e0f2fe', border: '#0ea5e9', text: '#0369a1' },
        patient: { bg: '#fce7f3', border: '#ec4899', text: '#9d174d' },
      },
    },
  },
  plugins: [],
};
export default config;
