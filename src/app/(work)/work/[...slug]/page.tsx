import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
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
    <main className="mt-16 rounded-3xl ">
      <article className="relative mx-auto max-w-screen-md px-6 py-24 md:pt-32">
        <div className=" mb-8">
          <h1 className="mb-2 text-4xl font-medium">{project.title}</h1>
          {project.description && (
            <p className="mt-0 text-xl text-slate-700 dark:text-slate-200">{project.description}</p>
          )}
        </div>
        <div className="grid grid-cols-7">
          <div className="col-span-7 grid grid-cols-1 sm:grid-cols-3 md:col-span-2 md:grid-cols-1">
            <div className="col-span-1 mb-6">
              <p className="mb-4 text-xs font-semibold uppercase text-dark_grey">My role</p>
              <p className="text-base leading-relaxed">{project.role}</p>
            </div>
            <div className="col-span-1 mb-6">
              <p className="mb-4 text-xs font-semibold uppercase text-dark_grey">Tools</p>
              <p className="text-base leading-relaxed">{project.tools}</p>
            </div>
            <div className="col-span-1 mb-6">
              <p className="mb-4 text-xs font-semibold uppercase text-dark_grey">Timeline</p>
              <p className="text-base leading-relaxed">{project.timeline}</p>
            </div>
          </div>
          <div className="col-span-7 md:col-span-5">
            <div className="mb-6">
              <p className="mb-4 text-xs font-semibold uppercase text-dark_grey">Description</p>
              <p className="text-base leading-relaxed">{project.description}</p>
            </div>
            <div className="mb-6">
              <p className="mb-4 text-xs font-semibold uppercase text-dark_grey">Context</p>
              <p className="text-base leading-relaxed">{project.context}</p>
            </div>
          </div>
        </div>
      </article>
      <Container>
        <section>
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
      </Container>
      <section className="mx-auto max-w-screen-md px-6 py-24">
        <Mdx code={project.body.code} />
      </section>
    </main>
  );
}
