import '@/styles/globals.css';

import type { Metadata } from 'next';

import type { RootLayoutProps } from '@/types/index';

import { Analytics } from '@/components/Analytics';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { TailwindIndicator } from '@/components/TailwindIndicator';

import { fontSans } from '@/lib/fonts';
import meta from '@/lib/meta';
import { SoundProvider } from '@/utils/sound';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await meta();
  return metadata;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${fontSans.variable} bg-white text-black`}>
      <body className="h-full antialiased">
        <SoundProvider>
          <Header />
          {children}
          <Footer />
          <TailwindIndicator />
          <Analytics />
        </SoundProvider>
      </body>
    </html>
  );
}
