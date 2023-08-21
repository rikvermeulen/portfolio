import type { Metadata } from 'next';

import Container from '@/components/Container';

export const metadata: Metadata = {
  title: 'Work',
  description: 'Welcome to my portfolio',
};

export default function Work() {
  return (
    <main className="h-screen">
      <Container>
        <section className="relative pb-24 pt-16 md:pt-32">
          <h1 className="font-bold md:text-3xl">Almost There! 🚧</h1>
          <p className="max-w-xl pt-2 text-dark_grey md:text-lg">
            My portfolio is in the final stages of polishing. Like a perfectly baked Dutch
            stroopwafel, I want everything to be just right. Come back soon to see the final result!
          </p>
        </section>
      </Container>
    </main>
  );
}
