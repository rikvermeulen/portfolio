/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";

import {
  DEFAULT_DEVICE_MEMORY_GB,
  DEFAULT_HARDWARE_CONCURRENCY,
  LOW_END_MAX_DEVICE_MEMORY_GB,
  LOW_END_MAX_HARDWARE_CONCURRENCY,
  useIsLowEndDevice,
} from "./useIsLowEndDevice.ts";

describe("useIsLowEndDevice", () => {
  const realNavigator = global.navigator;

  afterEach(() => {
    global.navigator = realNavigator;
    jest.resetAllMocks();
  });

  it("returns false when navigator is completely undefined", () => {
    // @ts-ignore
    delete global.navigator;

    const { result } = renderHook(() => useIsLowEndDevice());
    expect(result.current).toBe(false);
  });

  it("returns false when both deviceMemory and hardwareConcurrency are undefined", () => {
    Object.defineProperty(global.navigator, "deviceMemory", {
      configurable: true,
      writable: true,
      value: undefined,
    });
    Object.defineProperty(global.navigator, "hardwareConcurrency", {
      configurable: true,
      writable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useIsLowEndDevice());
    expect(result.current).toBe(false);
  });

  it("returns true when deviceMemory is exactly at the low-end threshold", () => {
    Object.defineProperty(global.navigator, "deviceMemory", {
      configurable: true,
      writable: true,
      value: LOW_END_MAX_DEVICE_MEMORY_GB,
    });
    Object.defineProperty(global.navigator, "hardwareConcurrency", {
      configurable: true,
      writable: true,
      value: DEFAULT_HARDWARE_CONCURRENCY,
    });

    const { result } = renderHook(() => useIsLowEndDevice());
    expect(result.current).toBe(true);
  });

  it("returns true when hardwareConcurrency is exactly at the low-end threshold", () => {
    Object.defineProperty(global.navigator, "deviceMemory", {
      configurable: true,
      writable: true,
      value: DEFAULT_DEVICE_MEMORY_GB,
    });
    Object.defineProperty(global.navigator, "hardwareConcurrency", {
      configurable: true,
      writable: true,
      value: LOW_END_MAX_HARDWARE_CONCURRENCY,
    });

    const { result } = renderHook(() => useIsLowEndDevice());
    expect(result.current).toBe(true);
  });

  it("returns true when both deviceMemory and hardwareConcurrency are below thresholds", () => {
    Object.defineProperty(global.navigator, "deviceMemory", {
      configurable: true,
      writable: true,
      value: LOW_END_MAX_DEVICE_MEMORY_GB - 1,
    });
    Object.defineProperty(global.navigator, "hardwareConcurrency", {
      configurable: true,
      writable: true,
      value: LOW_END_MAX_HARDWARE_CONCURRENCY - 1,
    });

    const { result } = renderHook(() => useIsLowEndDevice());
    expect(result.current).toBe(true);
  });

  it("returns false when both deviceMemory and hardwareConcurrency are above thresholds", () => {
    Object.defineProperty(global.navigator, "deviceMemory", {
      configurable: true,
      writable: true,
      value: LOW_END_MAX_DEVICE_MEMORY_GB + 1,
    });
    Object.defineProperty(global.navigator, "hardwareConcurrency", {
      configurable: true,
      writable: true,
      value: LOW_END_MAX_HARDWARE_CONCURRENCY + 1,
    });

    const { result } = renderHook(() => useIsLowEndDevice());
    expect(result.current).toBe(false);
  });

  it("returns true when only deviceMemory is low", () => {
    Object.defineProperty(global.navigator, "deviceMemory", {
      configurable: true,
      writable: true,
      value: 1,
    });
    Object.defineProperty(global.navigator, "hardwareConcurrency", {
      configurable: true,
      writable: true,
      value: DEFAULT_HARDWARE_CONCURRENCY,
    });

    const { result } = renderHook(() => useIsLowEndDevice());
    expect(result.current).toBe(true);
  });

  it("returns true when only hardwareConcurrency is low", () => {
    Object.defineProperty(global.navigator, "deviceMemory", {
      configurable: true,
      writable: true,
      value: DEFAULT_DEVICE_MEMORY_GB,
    });
    Object.defineProperty(global.navigator, "hardwareConcurrency", {
      configurable: true,
      writable: true,
      value: 1,
    });

    const { result } = renderHook(() => useIsLowEndDevice());
    expect(result.current).toBe(true);
  });
});
