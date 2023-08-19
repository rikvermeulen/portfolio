import Pill from '@/components/Pill';

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
    <footer className="fixed bottom-5 z-50 w-full">
      <div className="flex items-center justify-center">
        <Pill items={items} />
      </div>
    </footer>
  );
}
