/**
 * @jest-environment jsdom
 */

import {
  getServerSnapshot,
  usePrefersReducedMotion,
} from "@/hooks/usePrefersReducedMotion/usePrefersReducedMotion.ts";
import { act, renderHook } from "@testing-library/react";

describe("usePrefersReducedMotion", () => {
  let mockMediaQuery: {
    matches: boolean;
    media: string;
    listeners: ((event: MediaQueryListEvent) => void)[];
    addEventListener: (
      event: string,
      listener: (event: MediaQueryListEvent) => void,
    ) => void;
    removeEventListener: (
      event: string,
      listener: (event: MediaQueryListEvent) => void,
    ) => void;
    dispatchEvent: (event: MediaQueryListEvent) => void;
  };

  beforeEach(() => {
    // Mock window.matchMedia
    mockMediaQuery = {
      matches: false, // Default state
      media: "(prefers-reduced-motion: reduce)",
      listeners: [],
      addEventListener: jest.fn((event, listener) => {
        if (event === "change") {
          mockMediaQuery.listeners.push(listener);
        }
      }),
      removeEventListener: jest.fn((event, listener) => {
        if (event === "change") {
          mockMediaQuery.listeners = mockMediaQuery.listeners.filter(
            (l) => l !== listener,
          );
        }
      }),
      dispatchEvent: jest.fn((event: MediaQueryListEvent) => {
        mockMediaQuery.listeners.forEach(
          (listener: (event: MediaQueryListEvent) => void) => listener(event),
        );
      }),
    };

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation(() => mockMediaQuery),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return false when prefers-reduced-motion is not set", () => {
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });

  test("should return true when prefers-reduced-motion is set to reduce", () => {
    mockMediaQuery.matches = true;

    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  test("should update value when prefers-reduced-motion changes", () => {
    const { result } = renderHook(() => usePrefersReducedMotion());

    expect(result.current).toBe(false);

    act(() => {
      // Simulate a change to reduced motion
      mockMediaQuery.matches = true;
      mockMediaQuery.dispatchEvent({
        matches: true,
        media: "(prefers-reduced-motion: reduce)",
      } as MediaQueryListEvent);
    });

    expect(result.current).toBe(true);
  });

  test("should clean up event listener on unmount", () => {
    const { unmount } = renderHook(() => usePrefersReducedMotion());

    unmount();

    expect(mockMediaQuery.removeEventListener).toHaveBeenCalledTimes(1);
  });

  test("getServerSnapshot returns false for SSR", () => {
    expect(getServerSnapshot()).toBe(false);
  });
});
