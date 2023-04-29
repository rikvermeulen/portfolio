import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Manifest {
  const host = process.env.NEXT_PUBLIC_APP_URL as string;

  return {
    name: 'Rik Vermeulen | Portfolio',
    short_name: 'Rik Vermeulen',
    description:
      'Discover the portfolio of Rik Vermeulen, showcasing web development projects and skills.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    categories: ['education', 'personalization', 'productivity'],
    icons: [
      {
        src: `${host}/favicons/favicon.ico`,
        sizes: '32x32',
        type: 'image/x-icon',
        purpose: 'maskable',
      },
      {
        src: `${host}/favicons/icon-192x192.png`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
