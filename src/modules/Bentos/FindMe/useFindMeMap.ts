import { useEffect, useRef } from "react";

import type mapboxgl from "mapbox-gl";

import { env } from "@/env.ts";

import {
  FIND_ME_CENTER,
  FIND_ME_LOCATION,
  FIND_ME_MAP,
} from "./FindMe.const.ts";

const MAP_TOKEN = env.NEXT_PUBLIC_MAPBOX_TOKEN;

const TELEMETRY_ERROR_MARKERS = [
  "events.mapbox.com",
  "ERR_BLOCKED_BY_CONTENT_BLOCKER",
  "net::ERR_BLOCKED_BY_CONTENT_BLOCKER",
] as const;

const isTelemetryError = (message: string): boolean =>
  TELEMETRY_ERROR_MARKERS.some((marker) => message.includes(marker));

const createMapMarker = (): HTMLDivElement => {
  const marker = document.createElement("div");
  marker.className = "findme-marker";
  marker.setAttribute("role", "img");
  marker.setAttribute("aria-label", "My location");

  const ping = document.createElement("span");
  ping.className = "findme-marker-ping";

  const dot = document.createElement("span");
  dot.className = "findme-marker-dot";

  marker.append(ping, dot);
  return marker;
};

const observeMapResize = (
  map: mapboxgl.Map,
  container: HTMLDivElement,
): { handleResize: () => void; disconnect: () => void } => {
  let raf: number | null = null;
  let lastW = 0;
  let lastH = 0;

  const handleResize = () => {
    if (raf !== null) {
      return;
    }

    raf = requestAnimationFrame(() => {
      raf = null;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === lastW && height === lastH) {
        return;
      }
      lastW = width;
      lastH = height;
      map.resize();
    });
  };

  return {
    handleResize,
    disconnect: () => {
      if (raf !== null) {
        cancelAnimationFrame(raf);
      }
    },
  };
};

export const useFindMeMap = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const triedFallbackRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !MAP_TOKEN) {
      return;
    }

    let cancelled = false;
    let disposeMap: (() => void) | undefined;

    const initMap = async (): Promise<void> => {
      const mapbox = (await import("mapbox-gl")).default;
      if (cancelled || !containerRef.current) {
        return;
      }

      const mapboxApi = mapbox as typeof mapbox & {
        setTelemetryEnabled?: (enabled: boolean) => void;
      };
      mapboxApi.setTelemetryEnabled?.(false);
      mapbox.accessToken = MAP_TOKEN;

      const map = new mapbox.Map({
        container: containerRef.current,
        style: FIND_ME_MAP.primaryStyle,
        center: [...FIND_ME_CENTER],
        zoom: FIND_ME_MAP.initialZoom,
        performanceMetricsCollection: false,
        collectResourceTiming: false,
        attributionControl: false,
        pitchWithRotate: false,
        dragRotate: false,
      });

      mapRef.current = map;

      new mapbox.Marker(createMapMarker())
        .setLngLat([FIND_ME_LOCATION.longitude, FIND_ME_LOCATION.latitude])
        .addTo(map);

      map.scrollZoom.disable();
      map.doubleClickZoom.disable();
      map.boxZoom.disable();
      map.dragPan.disable();

      const resize = observeMapResize(map, containerRef.current);

      const handleMapError = (event: { error?: { message?: string } }) => {
        const message = event.error?.message ?? "Unknown map error";
        if (isTelemetryError(message)) {
          return;
        }

        if (!triedFallbackRef.current) {
          triedFallbackRef.current = true;
          map.setStyle(FIND_ME_MAP.fallbackStyle);
        }
      };

      map.on("load", resize.handleResize);
      map.on("error", handleMapError);

      const resizeObserver = new ResizeObserver(resize.handleResize);
      resizeObserver.observe(containerRef.current);

      disposeMap = () => {
        resize.disconnect();
        resizeObserver.disconnect();
        map.off("error", handleMapError);
        map.remove();
        mapRef.current = null;
      };
    };

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver === "undefined") {
      void initMap();
    } else {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            observer?.disconnect();
            observer = null;
            void initMap();
          }
        },
        { rootMargin: "200px" },
      );
      observer.observe(container);
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      disposeMap?.();
    };
  }, []);

  const flyToZoom = (delta: number) => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    if (delta > 0 && map.getZoom() >= FIND_ME_MAP.maxZoom) {
      return;
    }

    map.flyTo({
      center: [...FIND_ME_CENTER],
      zoom: Math.min(
        FIND_ME_MAP.maxZoom,
        Math.max(FIND_ME_MAP.minZoom, map.getZoom() + delta),
      ),
      speed: 1,
      curve: 1,
    });
  };

  return {
    containerRef,
    hasToken: Boolean(MAP_TOKEN),
    zoomIn: () => flyToZoom(FIND_ME_MAP.zoomStep),
    zoomOut: () => flyToZoom(-FIND_ME_MAP.zoomStep),
  };
};
