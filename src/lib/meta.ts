import type { Metadata } from 'next';

import { env } from '@/env.mjs';

/**
 * Template metadata for app links
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadata-fields
 * @returns {Metadata}
 */

export default async function meta(): Promise<Metadata> {
  const host = env.NEXT_PUBLIC_APP_URL;

  // Template metadata for open graph
  const openGraph = {
    title: 'Rik Vermeulen - Creative Developer',
    description:
      'Discover the creative works and projects of Rik Vermeulen, a creative developer based in the Netherlands.',
    url: 'www.rikvermeulen.com',
    siteName: 'Portfolio - Rik Vermeulen',
    images: [
      {
        url: `${host}/images/og.png`,
        width: 1200,
        height: 600,
        alt: 'Lightning',
      },
    ],
    locale: 'en-US',
    type: 'website',
  };

  // Template metadata for robot.txt
  const robots = {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  };

  // Template metadata for Twitter
  const twitter = {
    card: 'summary_large_image',
    title: 'Lightning',
    description: 'Lightning boilerplate for nextjs',
    siteId: '123456789',
    creator: '@username',
    creatorId: '123456789',
    images: [`${host}/images/og.png`],
  };

  // Template metadata for language alternates
  const alternates = {
    alternates: {
      canonical: '/',
      languages: {
        'en-US': '/en-US',
        'nl-NL': '/-NL',
      },
    },
    media: {
      'only screen and (max-width: 600px)': 'https://lightning-teal.vercel.app/',
    },
  };

  return {
    metadataBase: new URL(host),
    title: 'Rik Vermeulen - Creative Developer in the Netherlands',
    description:
      'Explore the portfolio of Rik Vermeulen, showcasing expertise in web development, design, and creative solutions.',
    keywords: ['Web Development', 'Creative Design', 'Frontend Developer', 'Developer'],
    generator: 'Next.js',
    applicationName: 'Portfolio - Rik Vermeulen',
    referrer: 'origin-when-cross-origin',
    authors: [
      {
        name: 'Rik',
        url: 'www.rikvermeulen.com',
      },
    ],
    icons: {
      icon: [
        {
          media: '(prefers-color-scheme: light)',
          url: '/images/favicons/icon-32x32.png',
          href: '/images/favicons/icon-32x32.png',
        },
        {
          media: '(prefers-color-scheme: dark)',
          url: '/images/favicons/icon-32x32-light.png',
          href: '/images/favicons/icon-32x32-light.png',
        },
      ],
    },
    themeColor: 'black',
    colorScheme: 'dark',
    creator: 'Rik Vermeulen',
    publisher: 'Rik Vermeulen',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    other: {
      custom: 'meta',
    },
    openGraph,
    robots,
    twitter,
    alternates,
  };
}
