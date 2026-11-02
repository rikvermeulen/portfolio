/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";

import { useResizeObserver } from "./useResizeObserver.ts";

class MockResizeObserver {
  public static instances: MockResizeObserver[] = [];

  public observe = jest.fn();
  public disconnect = jest.fn();
  public unobserve = jest.fn();

  private readonly callback: ResizeObserverCallback;

  public constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    MockResizeObserver.instances.push(this);
  }

  public trigger(entries: Partial<ResizeObserverEntry>[]): void {
    this.callback(entries as ResizeObserverEntry[], this as unknown as ResizeObserver); // prettier-ignore
  }
}

const createRefObject = <T>(current: T): React.RefObject<T> => ({ current });

const entryFor = (target: Element): Partial<ResizeObserverEntry> => ({
  target,
});

beforeEach(() => {
  MockResizeObserver.instances = [];
  global.ResizeObserver =
    MockResizeObserver as unknown as typeof ResizeObserver;
});

afterEach(() => jest.clearAllMocks());

describe("useResizeObserver", () => {
  it("does not create an observer when the ref has no element", () => {
    const onResize = jest.fn();
    renderHook(() => useResizeObserver(createRefObject(null), onResize));

    expect(MockResizeObserver.instances).toHaveLength(0);
    expect(onResize).not.toHaveBeenCalled();
  });

  it("observes the element and runs the callback on resize", () => {
    const element = document.createElement("div");
    const onResize = jest.fn();
    renderHook(() => useResizeObserver(createRefObject(element), onResize));

    const observer = MockResizeObserver.instances[0]!;
    expect(observer.observe).toHaveBeenCalledWith(element);

    const entry = entryFor(element);
    observer.trigger([entry]);
    expect(onResize).toHaveBeenCalledTimes(1);
    expect(onResize).toHaveBeenCalledWith(entry);
  });

  it("ignores an empty observer callback", () => {
    const element = document.createElement("div");
    const onResize = jest.fn();
    renderHook(() => useResizeObserver(createRefObject(element), onResize));

    MockResizeObserver.instances[0]!.trigger([]);
    expect(onResize).not.toHaveBeenCalled();
  });

  it("keeps the observer but runs the latest callback when it changes", () => {
    const element = document.createElement("div");
    const ref = createRefObject(element);
    const first = jest.fn();
    const second = jest.fn();

    const { rerender } = renderHook(
      ({ onResize }: { onResize: (entry: ResizeObserverEntry) => void }) =>
        useResizeObserver(ref, onResize),
      { initialProps: { onResize: first } },
    );

    rerender({ onResize: second });

    // A fresh callback each render must not re-subscribe the observer.
    expect(MockResizeObserver.instances).toHaveLength(1);

    MockResizeObserver.instances[0]!.trigger([entryFor(element)]);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("disconnects the observer on unmount", () => {
    const element = document.createElement("div");
    const { unmount } = renderHook(() =>
      useResizeObserver(createRefObject(element), jest.fn()),
    );

    const observer = MockResizeObserver.instances[0]!;
    unmount();
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
  });
});
