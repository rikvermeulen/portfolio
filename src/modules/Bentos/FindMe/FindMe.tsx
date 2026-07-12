"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

import type { FindMeProps } from "./FindMe.types.ts";
// Type-only: the ~1.7 MB runtime is loaded lazily in the effect below (see the
// dynamic `import("mapbox-gl")`), so it never lands in the initial bundle.
import type mapboxgl from "mapbox-gl";

import Bento, { bentoBoxSizes } from "@/components/Bento/index.ts";
import Glass from "@/components/Glass/index.ts";
import Icon from "@/components/Icon/index.ts";
import { env } from "@/env.ts";
import classnames from "@/utils/classnames/classnames.ts";

import { FIND_ME_LOCATION } from "./FindMe.const.ts";
import FindMeWeatherBadge from "./FindMeWeatherBadge.tsx";
import { useFindMeConditions } from "./useFindMeConditions.ts";

import "./FindMe.css";

const PRIMARY_MAP_STYLE = "mapbox://styles/mapbox/streets-v12";
const FALLBACK_MAP_STYLE = "mapbox://styles/mapbox/outdoors-v12";
const MAP_TOKEN = env.NEXT_PUBLIC_MAPBOX_TOKEN;
const MAX_ZOOM = 16;
const MIN_ZOOM = 2;
const MARKER_PING_DURATION_S = 1;
const MARKER_PING_INTERVAL_S = 4;

const FindMe = ({ className }: FindMeProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const hasTriedFallbackStyleRef = useRef(false);
  const [mapFailed, setMapFailed] = useState(false);
  const [mapErrorMessage, setMapErrorMessage] = useState<string>("");
  const conditionsState = useFindMeConditions();

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || !MAP_TOKEN) {
      return;
    }

    let cancelled = false;
    let disposeMap: (() => void) | undefined;

    // Actual map init — runs only once the tile is (near) the viewport, and only
    // after the mapbox-gl runtime has been dynamically imported. Keeping the
    // heavy WebGL library and its context out of first paint is the whole point.
    const initMap = async (): Promise<void> => {
      const mapbox = (await import("mapbox-gl")).default;
      if (cancelled || !mapContainerRef.current) {
        return;
      }

      // Disable telemetry before setting access token and creating map
      const mapboxWithTelemetry = mapbox as typeof mapbox & {
        setTelemetryEnabled?: (enabled: boolean) => void;
      };
      if (typeof mapboxWithTelemetry.setTelemetryEnabled === "function") {
        mapboxWithTelemetry.setTelemetryEnabled(false);
      }

      mapbox.accessToken = MAP_TOKEN;

      const map = new mapbox.Map({
        container: mapContainerRef.current,
        style: PRIMARY_MAP_STYLE,
        center: [FIND_ME_LOCATION.longitude, FIND_ME_LOCATION.latitude],
        zoom: 12,
        performanceMetricsCollection: false,
        collectResourceTiming: false,
        attributionControl: false,
        pitchWithRotate: false,
        dragRotate: false,
      });

      mapRef.current = map;

      // Add breathing animation style if not already added
      if (!document.querySelector("#marker-breathing-animation")) {
        const style = document.createElement("style");
        style.id = "marker-breathing-animation";
        style.textContent = `
        @keyframes breathe-border {
          0%, 100% {
            box-shadow: inset 0 0 0 0.25rem white;
          }
          50% {
            box-shadow: inset 0 0 0 0.3rem white;
          }
        }
        @keyframes marker-ping {
          0% {
            transform: scale(1);
            opacity: 0.75;
          }
          ${((MARKER_PING_DURATION_S * 0.75) / MARKER_PING_INTERVAL_S) * 100}% {
            transform: scale(2);
            opacity: 0;
          }
          ${(MARKER_PING_DURATION_S / MARKER_PING_INTERVAL_S) * 100}%,
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
        .marker-border-breathe {
          animation: breathe-border 3s ease-in-out infinite;
          will-change: box-shadow;
        }
        .marker-ping-slow {
          animation: marker-ping ${MARKER_PING_INTERVAL_S}s cubic-bezier(0, 0, 0.2, 1) infinite;
          will-change: transform, opacity;
        }
      `;
        document.head.appendChild(style);
      }

      const markerElement = document.createElement("div");
      markerElement.className =
        "relative flex h-6 w-6 items-center justify-center";
      markerElement.setAttribute("role", "img");
      markerElement.setAttribute("aria-label", "My location");

      const pingSpan = document.createElement("span");
      pingSpan.className =
        "marker-ping-slow absolute inline-flex h-6 w-6 rounded-full bg-ds-blue opacity-75";

      const innerSpan = document.createElement("span");
      innerSpan.className =
        "relative inline-flex h-6 w-6 rounded-full bg-ds-blue shadow-md marker-border-breathe";

      markerElement.appendChild(pingSpan);
      markerElement.appendChild(innerSpan);

      new mapbox.Marker(markerElement)
        .setLngLat([FIND_ME_LOCATION.longitude, FIND_ME_LOCATION.latitude])
        .addTo(map);

      map.scrollZoom.disable();
      map.doubleClickZoom.disable();
      map.boxZoom.disable();
      map.dragPan.disable();

      // Guarded resize. Calling `map.resize()` straight from a ResizeObserver
      // feeds back into layout, and Safari (unlike Chrome) re-delivers the
      // observation, so an unguarded resize loops forever and freezes the tab.
      // Coalesce to one rAF and skip when the container size hasn't changed.
      let resizeRaf: number | null = null;
      let lastW = 0;
      let lastH = 0;
      const handleResize = () => {
        if (resizeRaf !== null) {
          return;
        }
        resizeRaf = requestAnimationFrame(() => {
          resizeRaf = null;
          const container = mapContainerRef.current;
          if (!container) {
            return;
          }
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

      const handleMapError = (event: { error?: { message?: string } }) => {
        const nextMessage = event.error?.message ?? "Unknown map error";
        const isBlockedTelemetryError =
          nextMessage.includes("events.mapbox.com") ||
          nextMessage.includes("ERR_BLOCKED_BY_CONTENT_BLOCKER") ||
          nextMessage.includes("net::ERR_BLOCKED_BY_CONTENT_BLOCKER");

        if (isBlockedTelemetryError) {
          // Silently ignore telemetry/analytics errors blocked by content blockers
          return;
        }

        setMapErrorMessage(nextMessage);

        if (!hasTriedFallbackStyleRef.current) {
          hasTriedFallbackStyleRef.current = true;
          map.setStyle(FALLBACK_MAP_STYLE);
          return;
        }

        setMapFailed(true);
      };

      map.on("load", handleResize);
      map.on("error", handleMapError);

      const resizeObserver = new ResizeObserver(handleResize);
      if (mapContainerRef.current) {
        resizeObserver.observe(mapContainerRef.current);
      }

      disposeMap = () => {
        resizeObserver.disconnect();
        if (resizeRaf !== null) {
          cancelAnimationFrame(resizeRaf);
        }
        map.off("error", handleMapError);
        map.remove();
        mapRef.current = null;
      };
    };

    // Defer the whole thing until the map tile approaches the viewport, so the
    // WebGL context + tile fetches don't compete with first paint. Falls back to
    // an immediate load where IntersectionObserver is unavailable.
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver === "undefined") {
      void initMap();
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
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

  const handleZoomIn = useCallback(() => {
    if (!mapRef.current) {
      return;
    }

    const currentZoom = mapRef.current.getZoom();
    if (currentZoom >= MAX_ZOOM) {
      return;
    }

    mapRef.current.flyTo({
      center: [FIND_ME_LOCATION.longitude, FIND_ME_LOCATION.latitude],
      zoom: Math.min(MAX_ZOOM, currentZoom + 3),
      speed: 1,
      curve: 1,
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!mapRef.current) {
      return;
    }

    const currentZoom = mapRef.current.getZoom();
    mapRef.current.flyTo({
      center: [FIND_ME_LOCATION.longitude, FIND_ME_LOCATION.latitude],
      zoom: Math.max(MIN_ZOOM, currentZoom - 3),
      speed: 1,
      curve: 1,
    });
  }, []);

  return (
    <Bento
      image="/images/icons/findme.png"
      sizes={bentoBoxSizes.findMe}
      className={classnames("relative z-0 size-full bg-ds-map", className)}
    >
      {MAP_TOKEN ? (
        <div ref={mapContainerRef} className="findme-map size-full" />
      ) : (
        <div className="flex size-full items-center justify-center p-6 text-center text-sm text-ds-gray">
          Add NEXT_PUBLIC_MAPBOX_TOKEN to enable this map.
        </div>
      )}

      <FindMeWeatherBadge state={conditionsState} />

      <div className="pointer-events-none absolute top-0 z-10">
        <Image
          alt="Cloud"
          height={267}
          src="/images/cloud.png"
          width={300}
          className="cloud-one h-auto w-auto -translate-x-full -translate-y-32 opacity-90 contrast-125 transition-transform ease-in-out"
        />
        <Image
          alt="Cloud"
          height={214}
          src="/images/cloud.png"
          width={240}
          className="cloud-two h-auto w-auto -translate-x-full -translate-y-32 opacity-80 contrast-125 transition-transform ease-in-out"
        />
      </div>

      <div className="group absolute right-5 bottom-5 z-20 flex h-8 overflow-hidden rounded-2xl">
        <Glass intensity={2} interactive radius={16} />
        <button
          aria-label="Zoom out"
          onClick={handleZoomOut}
          type="button"
          className="relative flex size-8 items-center justify-center text-black transition-transform active:scale-90 dark:text-white"
        >
          <Icon iconClassName="size-3.5" name="minus" />
        </button>
        <button
          aria-label="Zoom in"
          onClick={handleZoomIn}
          type="button"
          className="relative flex size-8 items-center justify-center text-black transition-transform active:scale-90 dark:text-white"
        >
          <Icon iconClassName="size-3.5" name="plus" />
        </button>
      </div>
      {mapFailed && (
        <p className="absolute top-16 left-5 z-20 rounded-md bg-white/80 px-2 py-1 text-xs dark:bg-black/80 dark:text-white">
          {`Map style failed: ${mapErrorMessage}`}
        </p>
      )}
    </Bento>
  );
};

export default FindMe;
