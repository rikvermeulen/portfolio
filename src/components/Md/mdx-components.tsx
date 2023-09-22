'use client';

import { useMDXComponent } from 'next-contentlayer/hooks';

import {
  CustomH1,
  CustomH2,
  CustomH3,
  CustomH4,
  CustomH5,
  CustomH6,
} from '@/components/Md/CustomHeading';
import CustomImage from '@/components/Md/CustomImage';
import { CustomLI, CustomOL, CustomP } from '@/components/Md/CustomRichText';

const components = {
  h1: CustomH1,
  h2: CustomH2,
  h3: CustomH3,
  h4: CustomH4,
  h5: CustomH5,
  h6: CustomH6,
  p: CustomP,
  ol: CustomOL,
  li: CustomLI,
  Image: CustomImage,
};

interface MdxProps {
  code: string;
}

export function Mdx({ code }: MdxProps) {
  const Component = useMDXComponent(code);

  return <Component components={components as any} />;
}
