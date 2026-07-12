/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";

import { useOutsideClick } from "./useOutsideClick.ts";

function createRefObject<T>(current: T): React.RefObject<T> {
  return { current };
}

function setup(enabled = true) {
  const inner = document.createElement("div");
  const outer = document.createElement("div");
  document.body.appendChild(outer);
  outer.appendChild(inner);

  const ref = createRefObject(inner);
  const callback = jest.fn();

  renderHook(() => useOutsideClick(ref, callback, enabled));

  return { ref, callback, inner, outer };
}

afterEach(() => {
  document.body.innerHTML = "";
  jest.clearAllMocks();
});

describe("useOutsideClick", () => {
  test("does not call callback when clicking inside the ref element", () => {
    const { callback, inner } = setup();

    act(() => {
      inner.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });

    expect(callback).not.toHaveBeenCalled();
  });

  test("calls callback when clicking outside the ref element", () => {
    const { callback, outer } = setup();

    act(() => {
      outer.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("calls callback on touchstart outside", () => {
    const { callback, outer } = setup();

    act(() => {
      outer.dispatchEvent(new TouchEvent("touchstart", { bubbles: true }));
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("does not call callback when disabled", () => {
    const { callback, outer } = setup(false);

    act(() => {
      outer.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });

    expect(callback).not.toHaveBeenCalled();
  });

  test("removes listeners on unmount", () => {
    const removeEventListener = jest.spyOn(document, "removeEventListener");
    const { unmount } = renderHook(() =>
      useOutsideClick(createRefObject(null), jest.fn()),
    );

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith(
      "mousedown",
      expect.any(Function),
    );
    expect(removeEventListener).toHaveBeenCalledWith(
      "touchstart",
      expect.any(Function),
    );
  });

  test("removes listeners when enabled switches to false", () => {
    const removeEventListener = jest.spyOn(document, "removeEventListener");
    const ref = createRefObject<HTMLDivElement | null>(null);
    const callback = jest.fn();

    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useOutsideClick(ref, callback, enabled),
      { initialProps: { enabled: true } },
    );

    rerender({ enabled: false });

    expect(removeEventListener).toHaveBeenCalledWith(
      "mousedown",
      expect.any(Function),
    );
  });
});
