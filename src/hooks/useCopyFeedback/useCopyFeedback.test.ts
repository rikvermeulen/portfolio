/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";

import { useCopyFeedback } from "./useCopyFeedback.ts";

describe("useCopyFeedback", () => {
  const writeText = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("starts with copied false", () => {
    const { result } = renderHook(() => useCopyFeedback());

    expect(result.current.copied).toBe(false);
  });

  it("sets copied true after a successful copy and resets after the default delay", async () => {
    const { result } = renderHook(() => useCopyFeedback());

    await act(async () => {
      await result.current.copy("Hello");
    });

    expect(writeText).toHaveBeenCalledWith("Hello");
    expect(result.current.copied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.copied).toBe(false);
  });

  it("uses a custom feedback duration", async () => {
    const { result } = renderHook(() => useCopyFeedback(500));

    await act(async () => {
      await result.current.copy("Quick");
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(499);
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current.copied).toBe(false);
  });

  it("leaves copied false when clipboard write fails", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    const { result } = renderHook(() => useCopyFeedback());

    await act(async () => {
      await result.current.copy("Nope");
    });

    expect(result.current.copied).toBe(false);
  });

  it("clears the reset timer on unmount", async () => {
    const clearTimeoutSpy = jest.spyOn(globalThis, "clearTimeout");
    const { result, unmount } = renderHook(() => useCopyFeedback());

    await act(async () => {
      await result.current.copy("Bye");
    });

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
