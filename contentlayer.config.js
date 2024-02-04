import { defineDocumentType, makeSource } from 'contentlayer-temp/source-files';

/** @type {import('contentlayer-temp/source-files').ComputedFields} */
const computedFields = {
  slug: {
    type: 'string',
    resolve: (doc) => `/${doc._raw.flattenedPath}`,
  },
  slugAsParams: {
    type: 'string',
    resolve: (doc) => doc._raw.flattenedPath.split('/').slice(1).join('/'),
  },
};

export const Project = defineDocumentType(() => ({
  name: 'Project',
  filePathPattern: `work/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: {
      type: 'string',
      required: true,
    },
    subtitle: {
      type: 'string',
    },
    context: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    timeline: {
      type: 'string',
    },
    role: {
      type: 'string',
    },
    tools: {
      type: 'string',
    },
    website: {
      type: 'string',
    },
  },
  computedFields,
}));

export const Privacy = defineDocumentType(() => ({
  name: 'Privacy',
  filePathPattern: `privacy/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    name: {
      type: 'string',
      required: true,
    },
    address: {
      type: 'string',
    },
    mail: {
      type: 'string',
    },
  },
  computedFields,
}));

export default makeSource({
  contentDirPath: './src/content',
  documentTypes: [Project, Privacy],
});
