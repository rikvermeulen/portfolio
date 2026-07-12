import type { BentoAppKey } from "@/components/Bento/index.ts";
import type { QueuedToast } from "react-aria-components";

export interface AppToastContent {
  readonly app: BentoAppKey;
  readonly title: string;
  readonly description?: string;
  readonly date?: Date;
}

export interface ToastProps {
  readonly toast: QueuedToast<AppToastContent>;
}
