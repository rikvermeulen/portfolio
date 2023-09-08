import Link from 'next/link';

import Pill from '@/components/Pill';

import Container from './Container';

const items = [
  {
    name: 'About',
    url: '/',
  },
  {
    name: 'Work',
    url: '/work',
  },
  {
    name: 'Archive',
    url: '/archive',
  },
];

export default function Footer() {
  return (
    <footer>
      <div className="fixed bottom-5 z-50 flex w-full items-center justify-center">
        <Pill items={items} />
      </div>
      <Container>
        <div className="mb-8 flex justify-between font-medium text-black">
          <p className="text-sm">©2023 Rik Vermeulen</p>
          <Link className="cursor-pointer text-sm" href="/imprint">
            Imprint & Privacy
          </Link>
        </div>
      </Container>
    </footer>
  );
}
