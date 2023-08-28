import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { post } from '@supabase/storage-js/dist/module/lib/fetch';
import { allProjects } from 'contentlayer/generated';

import Bento from '@/components/Bento/Bento';
import Container from '@/components/Container';
import Grid from '@/components/Grid';
import { Mdx } from '@/components/mdx-components';

export async function generateMetadata({ params }: ProjectProps): Promise<Metadata> {
  const project = await getProjectFromParams(params);

  if (!project) {
    return {};
  }

  return {
    title: project.title,
    description: project.description,
  };
}

interface ProjectProps {
  params: {
    slug: string[];
  };
}

async function getProjectFromParams(params: ProjectProps['params']) {
  const slug = params?.slug?.join('/');
  const post = allProjects.find((post) => post.slugAsParams === slug);

  if (!post) {
    null;
  }

  return post;
}

export default async function Project({ params }: ProjectProps) {
  const project = await getProjectFromParams(params);

  if (!project) {
    notFound();
  }

  return (
    <main className="mt-16 rounded-3xl bg-slate-200">
      <Container>
        <section className="relative py-24 md:pt-32">
          <article className="prose dark:prose-invert py-6">
            <h1 className="mb-2">{project.title}</h1>
            {project.description && (
              <p className="mt-0 text-xl text-slate-700 dark:text-slate-200">
                {project.description}
              </p>
            )}
            <hr className="my-4" />
          </article>
        </section>
        <section>
          {/* <div className="mb-2.5 hidden items-center justify-end gap-1 text-dark_grey 2xl:flex">
            <Icon type="mouse" className="shake h-4 w-4 fill-dark_grey" />
            <p className="text-xs ">Click around...</p>
          </div> */}
          <Grid>
            <Bento size="1x2" className="bento bg-gray-100">
              <p></p>
            </Bento>
            <Bento size="1x1" className="bento bg-gray-100">
              <p></p>
            </Bento>
            <Bento size="2x1" className="bento bg-gray-100">
              <p></p>
            </Bento>
            <Bento size="2x1" className="bento bg-gray-100">
              <p></p>
            </Bento>
            <Bento size="1x1" className="bento bg-gray-100">
              <p></p>
            </Bento>
          </Grid>
        </section>
        <section className="py-24">
          <Mdx code={project.body.code} />
        </section>
      </Container>
    </main>
  );
}
