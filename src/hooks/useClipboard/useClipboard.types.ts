export interface UseClipboardReturn {
  readonly copied: boolean;
  readonly copy: (text: string) => Promise<boolean>;
}
