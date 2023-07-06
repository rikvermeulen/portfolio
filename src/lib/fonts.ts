import { JetBrains_Mono as mono, Inter as sans } from 'next/font/google';

export const fontMono = mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const fontSans = sans({
  subsets: ['latin'],
  variable: '--font-sans',
});
