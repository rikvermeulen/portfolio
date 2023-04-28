import '@/styles/global.css';
import type { Metadata } from 'next';

import type { RootLayoutProps } from '@/types/index';

import { FKDisplay, fontSans } from '@/lib/fonts';
import { Analytics } from '@/components/Analytics';
import Header from '@/components/Header';
import meta from '@/app/meta';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await meta();
  return metadata;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${FKDisplay.variable} ${fontSans.variable}`}>
      <body>
        <div className="fixed -z-0 h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-cyan-100" />
        <Header />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
