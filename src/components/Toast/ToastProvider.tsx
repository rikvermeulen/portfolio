"use client";

import {
  UNSTABLE_ToastList as ToastList,
  UNSTABLE_ToastRegion as ToastRegion,
} from "react-aria-components";

import type { AppToastContent } from "./Toast.types.ts";

import Toast from "./Toast.tsx";
import { toastQueue } from "./toastQueue.ts";

/**
 * Site-wide toast landmark. Mount once (in the root layout); it renders nothing
 * until `notify()` queues a toast, then stacks them top-right like macOS
 * Notification Center. react-aria lists the newest toast first, so a plain
 * column keeps the newest banner on top while older ones settle beneath it.
 */
const ToastProvider = () => (
  <ToastRegion
    queue={toastQueue}
    className="focus-ring fixed inset-x-4 top-4 z-9999 rounded-2xl sm:inset-x-auto sm:right-4"
  >
    <ToastList<AppToastContent> className="flex w-full flex-col gap-2.5 sm:w-88">
      {({ toast }) => <Toast toast={toast} />}
    </ToastList>
  </ToastRegion>
);

export default ToastProvider;
