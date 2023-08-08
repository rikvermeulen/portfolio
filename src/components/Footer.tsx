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
    <footer className="w-full">
      <Container>
        <div className="sticky bottom-5 flex items-center justify-center">
          <Pill items={items} />
        </div>
        <div className="flex justify-between">
          <p>Made with ❤️</p>
          <p>© 2021 Rik Vermeulen</p>
        </div>
      </Container>
    </footer>
  );
}
