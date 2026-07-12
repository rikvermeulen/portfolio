import type { AppToastContent } from "./Toast.types.ts";
import type { NotifyOptions } from "./toastQueue.ts";

export interface ToastMock {
  readonly label: string;
  readonly content: AppToastContent;
  readonly options?: NotifyOptions;
}

/**
 * Sample notifications spanning a few bento "apps", used by the story to fire
 * toasts on demand. Dates are relative to render time so the stamps read
 * naturally ("now", "Yesterday, …").
 */
export const toastMocks: readonly ToastMock[] = [
  {
    label: "Copy email",
    content: {
      app: "contact",
      title: "Email copied",
      description: "hello@rikvermeulen.com",
    },
  },
  {
    label: "Now playing",
    content: {
      app: "music",
      title: "Now playing",
      description: "Bonobo — Kerala",
    },
  },
  {
    label: "New journal entry",
    content: {
      app: "journal",
      title: "Question copied",
      description: "What made you smile today?",
    },
  },
  {
    label: "Game achievement",
    content: {
      app: "games",
      title: "Achievement unlocked",
      description: "Completed the tutorial on Hades",
    },
  },
];
