import { Inter as sans } from 'next/font/google';
import localFont from 'next/font/local';

/**
 * @next/font will optimize your fonts and remove external network requests
 * @see https://beta.nextjs.org/docs/optimizing/fonts
 */

// Font files can be colocated inside of `app`
export const FKDisplay = localFont({
  src: '../../public/fonts/FKDisplay-Regular.ttf',
  variable: '--font-fkdisplay',
  display: 'swap',
});
export const fontSans = sans({
  subsets: ['latin'],
  variable: '--font-sans',
});
