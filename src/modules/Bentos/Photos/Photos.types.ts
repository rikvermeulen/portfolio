import type { WithErrorMessage } from "@/types/index.ts";

export interface PhotosProps extends WithErrorMessage {
  readonly albums: Record<string, readonly string[]>;
}
