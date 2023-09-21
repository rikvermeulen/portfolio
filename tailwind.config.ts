import { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        '2xs': '0.625rem',
        '3xs': '0.5rem',
        '4xs': '0.375rem',
      },
      colors: {
        primary: '#E2E2E2',
        dark_grey: '#707070',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
      },
    },
  },
} satisfies Config;
