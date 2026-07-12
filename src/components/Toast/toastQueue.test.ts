/**
 * @jest-environment jsdom
 */

import { notify, toastQueue } from "./toastQueue.ts";

describe("toastQueue / notify", () => {
  afterEach(() => {
    // Drain the shared singleton so timers/state don't leak between tests.
    for (const toast of [...toastQueue.visibleToasts]) {
      toastQueue.close(toast.key);
    }
  });

  it("enqueues a toast carrying the given content", () => {
    notify({ app: "music", title: "Now playing", description: "Kerala" });

    expect(toastQueue.visibleToasts.at(-1)?.content).toMatchObject({
      app: "music",
      title: "Now playing",
      description: "Kerala",
    });
  });

  it("applies the default 6s timeout", () => {
    notify({ app: "contact", title: "Email copied" });

    expect(toastQueue.visibleToasts.at(-1)?.timeout).toBe(6000);
  });

  it("honours an explicit timeout override", () => {
    notify({ app: "journal", title: "Question copied" }, { timeout: 2000 });

    expect(toastQueue.visibleToasts.at(-1)?.timeout).toBe(2000);
  });

  it("returns a key that can dismiss the toast", () => {
    const key = notify({ app: "games", title: "Achievement unlocked" });

    expect(typeof key).toBe("string");
    toastQueue.close(key);
    expect(toastQueue.visibleToasts.some((toast) => toast.key === key)).toBe(
      false,
    );
  });
});
