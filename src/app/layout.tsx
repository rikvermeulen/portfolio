import '../styles/global.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';

import Header from './components/Header';
import { meta } from './meta';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

// Font files can be colocated inside of `app`
const FKDisplay = localFont({
  src: '../../public/fonts/FKDisplay-Regular.ttf',
  variable: '--font-fkdisplay',
  display: 'swap',
});
export async function generateMetadata(): Promise<Metadata> {
  return meta;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${FKDisplay.variable} ${inter.variable} relative bg-black`}>
      <head />
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
