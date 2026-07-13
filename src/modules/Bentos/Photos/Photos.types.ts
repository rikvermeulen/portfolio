import type { BentoSizedProps } from "@/components/Bento/index.ts";

export interface PhotosProps extends BentoSizedProps {
  readonly albums: Record<string, readonly string[]>;
}
