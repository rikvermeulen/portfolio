import { useEffect, useRef } from "react";

import type mapboxgl from "mapbox-gl";

import { env } from "@/env.ts";
import { useResizeObserver } from "@/hooks/useResizeObserver/index.ts";

import {
  FIND_ME_CENTER,
  FIND_ME_LOCATION,
  FIND_ME_MAP,
} from "./FindMe.const.ts";

const MAP_TOKEN = env.NEXT_PUBLIC_MAPBOX_TOKEN;

/** Telemetry requests blocked by ad/content blockers surface as map errors. */
const isTelemetryError = (message: string): boolean =>
  message.includes("events.mapbox.com") ||
  message.includes("ERR_BLOCKED_BY_CONTENT_BLOCKER");

const createMarkerElement = (): HTMLDivElement => {
  const marker = document.createElement("div");
  marker.className = "findme-marker";
  marker.setAttribute("role", "img");
  marker.setAttribute("aria-label", `My location: ${FIND_ME_LOCATION.label}`);

  const ping = document.createElement("span");
  ping.className = "findme-marker-ping";
  const dot = document.createElement("span");
  dot.className = "findme-marker-dot";
  marker.append(ping, dot);

  return marker;
};

export const useFindMeMap = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // Keep the WebGL canvas sized to its container (no-op until the map exists).
  useResizeObserver(containerRef, () => mapRef.current?.resize());

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !MAP_TOKEN) {
      return;
    }

    let disposeMap: (() => void) | undefined;

    const initMap = async (): Promise<void> => {
      const mapbox = (await import("mapbox-gl")).default;
      const target = containerRef.current;
      if (!target) {
        return; // Unmounted while the mapbox chunk was loading.
      }

      (
        mapbox as typeof mapbox & {
          setTelemetryEnabled?: (enabled: boolean) => void;
        }
      ).setTelemetryEnabled?.(false);
      mapbox.accessToken = MAP_TOKEN;

      const map = new mapbox.Map({
        container: target,
        style: FIND_ME_MAP.primaryStyle,
        center: [...FIND_ME_CENTER],
        zoom: FIND_ME_MAP.initialZoom,
        attributionControl: false,
        dragRotate: false,
        pitchWithRotate: false,
        performanceMetricsCollection: false,
      });
      mapRef.current = map;

      new mapbox.Marker(createMarkerElement())
        .setLngLat([...FIND_ME_CENTER])
        .addTo(map);

      // A static, non-interactive tile — disable every user gesture.
      map.scrollZoom.disable();
      map.doubleClickZoom.disable();
      map.boxZoom.disable();
      map.dragPan.disable();

      // Retry once with a fallback style if the primary fails; ignore telemetry
      // errors, which aren't real load failures.
      let triedFallback = false;
      const handleError = ({ error }: { error?: { message?: string } }) => {
        if (isTelemetryError(error?.message ?? "") || triedFallback) {
          return;
        }
        triedFallback = true;
        map.setStyle(FIND_ME_MAP.fallbackStyle);
      };
      map.on("error", handleError);

      disposeMap = () => {
        map.off("error", handleError);
        map.remove();
      };
    };

    // Defer the heavy mapbox chunk + WebGL init until the tile nears the viewport.
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) {
          return;
        }
        observer.disconnect();
        void initMap();
      },
      { rootMargin: "200px" },
    );
    observer.observe(container);

    return () => {
      observer.disconnect();
      disposeMap?.();
      mapRef.current = null;
    };
  }, []);

  const zoomBy = (delta: number) => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const current = map.getZoom();
    const next = Math.min(
      FIND_ME_MAP.maxZoom,
      Math.max(FIND_ME_MAP.minZoom, current + delta),
    );
    if (next === current) {
      return;
    }

    map.flyTo({ center: [...FIND_ME_CENTER], zoom: next, speed: 1, curve: 1 });
  };

  return {
    containerRef,
    hasToken: Boolean(MAP_TOKEN),
    zoomIn: () => zoomBy(FIND_ME_MAP.zoomStep),
    zoomOut: () => zoomBy(-FIND_ME_MAP.zoomStep),
  };
};
