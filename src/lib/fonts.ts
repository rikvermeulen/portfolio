import { Inter as sans } from 'next/font/google';
import localFont from 'next/font/local';

export const FKDisplay = localFont({
  src: '../../public/fonts/FKDisplay-Regular.ttf',
  variable: '--font-fkdisplay',
  display: 'swap',
});
export const fontSans = sans({
  subsets: ['latin'],
  variable: '--font-sans',
});
