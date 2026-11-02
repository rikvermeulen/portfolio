/**
 * @jest-environment jsdom
 */

import type { act as actType } from "@testing-library/react";
import type { createElement as createElementType } from "react";

import { FIND_ME_MAP } from "./FindMe.const.ts";

type EventHandler = (...args: unknown[]) => void;

type HookApi = ReturnType<(typeof import("./useFindMeMap.ts"))["useFindMeMap"]>;

interface Setup {
  api: HookApi;
  act: typeof actType;
  unmount: () => void;
}

// Controllable module-level state shared with the doMock factory + fake globals.
let currentZoom: number = FIND_ME_MAP.initialZoom;
let includeTelemetry = true;

let ioCallbacks: IntersectionObserverCallback[] = [];
let roCallback: ResizeObserverCallback | null = null;

// Filled in by `setup()` after re-importing the reset module registry so the
// module-level `Harness` component and the renderer share one React instance.
let activeHook: (typeof import("./useFindMeMap.ts"))["useFindMeMap"] | null =
  null;
let renderElement: typeof createElementType | null = null;
let shouldAttach = true;
const apiHolder: { current: HookApi | null } = { current: null };

/**
 * A hand-rolled mapbox `Map` stand-in. It records the constructor options,
 * captures every `on(...)` handler so tests can fire `"error"` events, and
 * exposes jest mocks for the imperative methods the hook calls.
 */
class MockMap {
  public static last: MockMap | null = null;

  public options: Record<string, unknown>;
  public handlers: Record<string, EventHandler[]> = {};

  public scrollZoom = { disable: jest.fn() };
  public doubleClickZoom = { disable: jest.fn() };
  public boxZoom = { disable: jest.fn() };
  public dragPan = { disable: jest.fn() };

  public resize = jest.fn();
  public remove = jest.fn();
  public setStyle = jest.fn();
  public flyTo = jest.fn();
  public getZoom = jest.fn(() => currentZoom);

  public on = jest.fn((event: string, cb: EventHandler) => {
    (this.handlers[event] ??= []).push(cb);
    return this;
  });

  public off = jest.fn((event: string, cb: EventHandler) => {
    this.handlers[event] = (this.handlers[event] ?? []).filter((h) => h !== cb);
    return this;
  });

  public constructor(options: Record<string, unknown>) {
    this.options = options;
    MockMap.last = this;
  }

  public fire(event: string, ...args: unknown[]): void {
    (this.handlers[event] ?? []).forEach((h) => h(...args));
  }
}

class MockMarker {
  public setLngLat = jest.fn(() => this);
  public addTo = jest.fn(() => this);

  public constructor(_element: HTMLElement) {
    void _element;
  }
}

class MockIntersectionObserver {
  public observe = jest.fn();
  public disconnect = jest.fn();
  public unobserve = jest.fn();
  public takeRecords = jest.fn(() => []);

  public constructor(cb: IntersectionObserverCallback) {
    ioCallbacks.push(cb);
  }
}

class MockResizeObserver {
  public observe = jest.fn();
  public disconnect = jest.fn();
  public unobserve = jest.fn();

  public constructor(cb: ResizeObserverCallback) {
    roCallback = cb;
  }
}

const setTelemetryMock = jest.fn();

const flushAsync = async (): Promise<void> => {
  for (let i = 0; i < 10; i++) {
    await Promise.resolve();
  }
};

function Harness() {
  const api = activeHook!();
  apiHolder.current = api;
  return shouldAttach
    ? renderElement!("div", { ref: api.containerRef })
    : renderElement!("div");
}

beforeEach(() => {
  MockMap.last = null;
  ioCallbacks = [];
  roCallback = null;
  currentZoom = FIND_ME_MAP.initialZoom;
  includeTelemetry = true;
  apiHolder.current = null;
  setTelemetryMock.mockClear();

  global.IntersectionObserver =
    MockIntersectionObserver as unknown as typeof IntersectionObserver;
  global.ResizeObserver =
    MockResizeObserver as unknown as typeof ResizeObserver;
});

afterEach(() => jest.clearAllMocks());

/**
 * Re-imports the hook with a freshly mocked `env` (so the module-load-time
 * `MAP_TOKEN` capture can be varied) and a mocked `mapbox-gl`. `@testing-library`
 * and `react` are re-imported after `resetModules()` too, so the hook and the
 * renderer share one React instance.
 */
const setup = async (
  opts: { token?: string; attach?: boolean } = {},
): Promise<Setup> => {
  const { token = "pk.test", attach = true } = opts;
  shouldAttach = attach;

  jest.resetModules();
  jest.doMock("@/env.ts", () => ({
    env: { NEXT_PUBLIC_MAPBOX_TOKEN: token },
  }));
  jest.doMock("mapbox-gl", () => {
    const def: Record<string, unknown> = {
      accessToken: "",
      Map: MockMap,
      Marker: MockMarker,
    };
    if (includeTelemetry) {
      def.setTelemetryEnabled = setTelemetryMock;
    }
    return { __esModule: true, default: def };
  });

  const React = await import("react");
  // `/pure` skips the auto-cleanup afterEach registration, which would throw
  // when @testing-library is (re-)imported inside a running test.
  const { render, act } = await import("@testing-library/react/pure");
  const { useFindMeMap } = await import("./useFindMeMap.ts");

  activeHook = useFindMeMap;
  renderElement = React.createElement;

  let unmount!: () => void;
  await act(async () => {
    ({ unmount } = render(React.createElement(Harness)));
  });

  return { api: apiHolder.current!, act, unmount };
};

const fireIntersecting = async (
  act: typeof actType,
  isIntersecting = true,
): Promise<void> => {
  await act(async () => {
    ioCallbacks[0]!(
      [{ isIntersecting } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
    await flushAsync();
  });
};

describe("useFindMeMap", () => {
  it("returns early when the container ref is never attached", async () => {
    const { unmount } = await setup({ attach: false });

    expect(MockMap.last).toBeNull();
    expect(ioCallbacks).toHaveLength(0);
    expect(() => unmount()).not.toThrow();
  });

  it("returns early and reports hasToken=false when there is no token", async () => {
    const { api, unmount } = await setup({ token: "", attach: true });

    expect(api.hasToken).toBe(false);
    expect(MockMap.last).toBeNull();
    expect(ioCallbacks).toHaveLength(0);
    unmount();
  });

  it("observes the container and only initializes the map once intersecting", async () => {
    const { api, act, unmount } = await setup();

    expect(api.hasToken).toBe(true);
    expect(ioCallbacks).toHaveLength(1);

    // Empty entry list → optional chaining short-circuits, no init.
    await act(async () => {
      ioCallbacks[0]!([], {} as IntersectionObserver);
      await flushAsync();
    });
    expect(MockMap.last).toBeNull();

    // Present but not intersecting → still no init.
    await fireIntersecting(act, false);
    expect(MockMap.last).toBeNull();

    // Intersecting → map is created and configured.
    await fireIntersecting(act, true);
    const map = MockMap.last!;
    expect(map).not.toBeNull();
    expect(setTelemetryMock).toHaveBeenCalledWith(false);
    expect(map.options.style).toBe(FIND_ME_MAP.primaryStyle);
    expect(map.scrollZoom.disable).toHaveBeenCalled();
    expect(map.doubleClickZoom.disable).toHaveBeenCalled();
    expect(map.boxZoom.disable).toHaveBeenCalled();
    expect(map.dragPan.disable).toHaveBeenCalled();

    unmount();
  });

  it("aborts initialization when the container disappears mid-load", async () => {
    const { api, act, unmount } = await setup();

    act(() => {
      ioCallbacks[0]!(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    api.containerRef.current = null;
    await act(async () => {
      await flushAsync();
    });

    // Guarded by the `!target` check after the mapbox import resolves.
    expect(MockMap.last).toBeNull();
    unmount();
  });

  it("ignores telemetry errors, falls back once, then ignores further errors", async () => {
    const { act, unmount } = await setup();
    await fireIntersecting(act);
    const map = MockMap.last!;

    // Telemetry / content-blocker errors are ignored.
    map.fire("error", { error: { message: "blocked by events.mapbox.com" } });
    expect(map.setStyle).not.toHaveBeenCalled();

    // A real error (missing message → "") triggers the fallback.
    map.fire("error", {});
    expect(map.setStyle).toHaveBeenCalledTimes(1);
    expect(map.setStyle).toHaveBeenCalledWith(FIND_ME_MAP.fallbackStyle);

    // A second real error is a no-op (fallback already tried).
    map.fire("error", { error: { message: "boom" } });
    expect(map.setStyle).toHaveBeenCalledTimes(1);

    unmount();
    expect(map.off).toHaveBeenCalledWith("error", expect.any(Function));
    expect(map.remove).toHaveBeenCalled();
  });

  it("resizes the map when the observed container changes size", async () => {
    const { act, unmount } = await setup();
    await fireIntersecting(act);
    const map = MockMap.last!;

    expect(roCallback).not.toBeNull();
    act(() =>
      roCallback!([{} as ResizeObserverEntry], {} as unknown as ResizeObserver),
    );
    expect(map.resize).toHaveBeenCalledTimes(1);

    unmount();
  });

  it("does nothing when zooming before the map exists", async () => {
    const { api, act, unmount } = await setup();

    // Map never initialized (no intersection) → mapRef is null.
    act(() => api.zoomIn());
    expect(MockMap.last).toBeNull();
    unmount();
  });

  it("does not zoom past the maximum or minimum zoom", async () => {
    const { api, act, unmount } = await setup();
    await fireIntersecting(act);
    const map = MockMap.last!;

    currentZoom = FIND_ME_MAP.maxZoom;
    act(() => api.zoomIn());
    expect(map.flyTo).not.toHaveBeenCalled();

    currentZoom = FIND_ME_MAP.minZoom;
    act(() => api.zoomOut());
    expect(map.flyTo).not.toHaveBeenCalled();

    unmount();
  });

  it("zooms in toward the max and out toward the min", async () => {
    const { api, act, unmount } = await setup();
    await fireIntersecting(act);
    const map = MockMap.last!;

    currentZoom = FIND_ME_MAP.initialZoom;
    act(() => api.zoomIn());
    expect(map.flyTo).toHaveBeenLastCalledWith(
      expect.objectContaining({
        zoom: FIND_ME_MAP.initialZoom + FIND_ME_MAP.zoomStep,
      }),
    );

    act(() => api.zoomOut());
    expect(map.flyTo).toHaveBeenLastCalledWith(
      expect.objectContaining({
        zoom: FIND_ME_MAP.initialZoom - FIND_ME_MAP.zoomStep,
      }),
    );

    unmount();
  });

  it("initializes without telemetry control when setTelemetryEnabled is absent", async () => {
    includeTelemetry = false;

    const { act, unmount } = await setup();
    await fireIntersecting(act);

    expect(MockMap.last).not.toBeNull();
    expect(setTelemetryMock).not.toHaveBeenCalled();
    unmount();
  });
});
