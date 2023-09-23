import '@/styles/globals.css';

import type { Metadata } from 'next';

import type { IRootLayoutProps } from '@/types/types';

import { Analytics } from '@/components/Analytics';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { TailwindIndicator } from '@/components/TailwindIndicator';

import { SoundProvider } from '@/hooks/useSound';
import { fontSans } from '@/lib/fonts';
import meta from '@/lib/meta';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await meta();
  return metadata;
}

export default function RootLayout({ children }: IRootLayoutProps) {
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
