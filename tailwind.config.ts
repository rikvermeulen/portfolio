import { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        fk: ['var(--font-fkdisplay)', ...defaultTheme.fontFamily.sans],
      },
      backgroundColor: {
        header: 'hsla(0,0%,100%,.1)',
      },
    },
  },
  plugins: [require('prettier-plugin-tailwindcss')],
} satisfies Config;
