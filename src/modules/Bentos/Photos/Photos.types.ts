export interface PhotosProps {
  readonly albums: Record<string, readonly string[]>;
  readonly errorMessage?: string;
}
