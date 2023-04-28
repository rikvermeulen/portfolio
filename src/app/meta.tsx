import type { Metadata } from 'next';

export default function meta(): Metadata {
  const host = process.env.NEXT_PUBLIC_APP_URL as string;

  // Template metadata for open graph
  const openGraph = {
    title: 'Rik Vermeulen | Portfolio',
    description:
      'Discover the portfolio of Rik Vermeulen, showcasing web development projects and skills.',
    url: host,
    siteName: 'Rik Vermeulen Portfolio',
    images: [
      {
        url: `${host}/og.png`,
        width: 1200,
        height: 600,
        alt: 'Rik Vermeulen Portfolio',
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
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  };

  // Template metadata for all icons
  const icons = {
    // Add your favicon path here
  };

  // Template metadata for Twitter
  const twitter = {
    card: 'summary_large_image',
    title: 'Rik Vermeulen | Portfolio',
    description:
      'Discover the portfolio of Rik Vermeulen, showcasing web development projects and skills.',
    siteId: '123456789',
    creator: '@rikvermeulen_',
    creatorId: '123456789',
    images: [`${host}/og.png`],
  };

  return {
    generator: 'Next.js',
    applicationName: 'Rik Vermeulen Portfolio',
    title: 'Rik Vermeulen | Portfolio',
    description:
      'Discover the portfolio of Rik Vermeulen, showcasing web development projects and skills.',
    referrer: 'origin-when-cross-origin',
    keywords: ['Rik Vermeulen', 'Portfolio', 'Web Development'],
    authors: [
      {
        name: 'Rik Vermeulen',
        url: 'https://rikvermeulen.com',
      },
    ],
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
    icons,
    twitter,
  };
}
