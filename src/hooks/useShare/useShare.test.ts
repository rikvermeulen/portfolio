/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";

import { useShare } from "./useShare.ts";

const DATA = { title: "Prompt", text: "How are you?", url: "https://x.test" };

describe("useShare", () => {
  const share = jest.fn();
  const writeText = jest.fn();

  function setShareSupport(supported: boolean): void {
    Object.defineProperty(navigator, "share", {
      value: supported ? share : undefined,
      configurable: true,
    });
  }

  beforeEach(() => {
    jest.useFakeTimers();
    share.mockReset();
    writeText.mockReset();
    share.mockResolvedValue(undefined);
    writeText.mockResolvedValue(undefined);
    setShareSupport(true);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("starts with shared false", () => {
    const { result } = renderHook(() => useShare());

    expect(result.current.shared).toBe(false);
  });

  it("uses the native share sheet and flashes shared for the feedback window", async () => {
    const { result } = renderHook(() => useShare());

    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.share(DATA);
    });

    expect(share).toHaveBeenCalledWith(DATA);
    expect(writeText).not.toHaveBeenCalled();
    expect(outcome).toBe("shared");
    expect(result.current.shared).toBe(true);

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.shared).toBe(false);
  });

  it("honours a custom feedback duration", async () => {
    const { result } = renderHook(() => useShare(500));

    await act(async () => {
      await result.current.share(DATA);
    });
    expect(result.current.shared).toBe(true);

    act(() => {
      jest.advanceTimersByTime(499);
    });
    expect(result.current.shared).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current.shared).toBe(false);
  });

  it("treats an AbortError as a cancel without touching the clipboard", async () => {
    share.mockRejectedValue(new DOMException("dismissed", "AbortError"));
    const { result } = renderHook(() => useShare());

    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.share(DATA);
    });

    expect(outcome).toBe("cancelled");
    expect(writeText).not.toHaveBeenCalled();
    expect(result.current.shared).toBe(false);
  });

  it("falls back to the clipboard when sharing fails", async () => {
    share.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useShare());

    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.share(DATA);
    });

    expect(writeText).toHaveBeenCalledWith("How are you? https://x.test");
    expect(outcome).toBe("copied");
    expect(result.current.shared).toBe(true);
  });

  it("copies to the clipboard when the Web Share API is unavailable", async () => {
    setShareSupport(false);
    const { result } = renderHook(() => useShare());

    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.share({ text: "Only text" });
    });

    expect(share).not.toHaveBeenCalled();
    expect(writeText).toHaveBeenCalledWith("Only text");
    expect(outcome).toBe("copied");
  });

  it("returns failed when both sharing and the clipboard fail", async () => {
    share.mockRejectedValue(new Error("boom"));
    writeText.mockRejectedValue(new Error("denied"));
    const { result } = renderHook(() => useShare());

    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.share(DATA);
    });

    expect(outcome).toBe("failed");
    expect(result.current.shared).toBe(false);
  });

  it("clears the reset timer on unmount", async () => {
    const clearTimeoutSpy = jest.spyOn(globalThis, "clearTimeout");
    const { result, unmount } = renderHook(() => useShare());

    await act(async () => {
      await result.current.share(DATA);
    });

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
