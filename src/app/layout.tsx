import '@/styles/globals.css';

import type { Metadata } from 'next';

import type { RootLayoutProps } from '@/types/index';

import { fontSans } from '@/lib/fonts';
import meta from '@/lib/meta';
import { Analytics } from '@/components/Analytics';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { TailwindIndicator } from '@/components/TailwindIndicator';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await meta();
  return metadata;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${fontSans.variable} bg-white text-black`}>
      <body className="h-screen antialiased">
        <Header />
        {children}
        <Footer />
        <TailwindIndicator />
        <Analytics />
      </body>
    </html>
  );
}
