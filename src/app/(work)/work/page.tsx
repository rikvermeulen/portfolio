import type { Metadata } from 'next';
import Link from 'next/link';
import { allProjects } from 'contentlayer/generated';

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
          {allProjects.map((post: any) => (
            <article key={post._id}>
              <Link href={post.slug}>
                <h2>{post.title}</h2>
              </Link>
              {post.description && <p>{post.description}</p>}
            </article>
          ))}
        </section>
      </Container>
    </main>
  );
}
