import type { Metadata } from 'next';
import Link from 'next/link';
import { allProjects } from 'contentlayer/generated';

import Bento from '@/components/Bento/Bento';
import Container from '@/components/Container';
import Grid from '@/components/Grid';

export const metadata: Metadata = {
  title: 'Work',
  description: 'Welcome to my portfolio',
};

export default function Work() {
  return (
    <main className="h-screen">
      <Container>
        <section className="relative pb-24 pt-16 md:pt-32">
          <Grid>
            {allProjects.map((post: any) => (
              <Bento size="2x2" className="bento" key={post._id}>
                <Link href={post.slug}>
                  <h2>{post.title}</h2>
                </Link>
                {post.description && <p>{post.description}</p>}
              </Bento>
            ))}
          </Grid>
        </section>
      </Container>
    </main>
  );
}
