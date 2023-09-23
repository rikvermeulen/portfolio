import type { MetadataRoute } from 'next';

import { env } from '@/env.mjs';

export default function manifest(): MetadataRoute.Manifest {
  const host = env.NEXT_PUBLIC_APP_URL;

  return {
    name: 'Portfolio Rik Vermeulen',
    short_name: 'Portfolio R.V',
    description: 'Portfolio Rik Vermeulen',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    categories: ['education', 'personalization', 'productivity', 'utilities'],
    icons: [
      {
        src: `${host}/images/favicons/icon-32x32.png`,
        sizes: '32x32',
        type: 'image/x-icon',
        purpose: 'maskable',
      },
      {
        src: `${host}/images/favicons/icon-192x192.png`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
