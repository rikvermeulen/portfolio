"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import mapboxgl from "mapbox-gl";

import type { FindMeProps } from "./FindMe.types.ts";

import Bento, { bentoBoxSizes } from "@/components/Bento/index.ts";
import Glass from "@/components/Glass/index.ts";
import Icon from "@/components/Icon/index.ts";
import { FIND_ME_LOCATION } from "@/constants/findMe.ts";
import { env } from "@/env.ts";
import classnames from "@/utils/classnames/classnames.ts";

import FindMeWeatherBadge from "./FindMeWeatherBadge.tsx";
import { useFindMeConditions } from "./useFindMeConditions.ts";

const PRIMARY_MAP_STYLE = "mapbox://styles/mapbox/streets-v12";
const FALLBACK_MAP_STYLE = "mapbox://styles/mapbox/outdoors-v12";
const MAP_TOKEN = env.NEXT_PUBLIC_MAPBOX_TOKEN;
const MAX_ZOOM = 16;
const MIN_ZOOM = 2;
const MARKER_PING_DURATION_S = 1;
const MARKER_PING_INTERVAL_S = 4;

function FindMe({ className }: FindMeProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const hasTriedFallbackStyleRef = useRef(false);
  const [mapFailed, setMapFailed] = useState(false);
  const [mapErrorMessage, setMapErrorMessage] = useState<string>("");
  const conditionsState = useFindMeConditions();

  useEffect(() => {
    if (!mapContainerRef.current || !MAP_TOKEN) {
      return;
    }

    // Disable telemetry before setting access token and creating map
    const mapboxWithTelemetry = mapboxgl as typeof mapboxgl & {
      setTelemetryEnabled?: (enabled: boolean) => void;
    };
    if (typeof mapboxWithTelemetry.setTelemetryEnabled === "function") {
      mapboxWithTelemetry.setTelemetryEnabled(false);
    }

    mapboxgl.accessToken = MAP_TOKEN;

    const map = new mapboxgl.Map({
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
      "marker-ping-slow absolute inline-flex h-6 w-6 rounded-full bg-[#007AFF] opacity-75";

    const innerSpan = document.createElement("span");
    innerSpan.className =
      "relative inline-flex h-6 w-6 rounded-full bg-[#007AFF] shadow-md marker-border-breathe";

    markerElement.appendChild(pingSpan);
    markerElement.appendChild(innerSpan);

    new mapboxgl.Marker(markerElement)
      .setLngLat([FIND_ME_LOCATION.longitude, FIND_ME_LOCATION.latitude])
      .addTo(map);

    map.scrollZoom.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
    map.dragPan.disable();

    const handleResize = () => {
      map.resize();
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
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      map.off("error", handleMapError);
      map.remove();
      mapRef.current = null;
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
      className={classnames("relative z-0 size-full bg-[#dbeefe]", className)}
    >
      {MAP_TOKEN ? (
        <div ref={mapContainerRef} className="findme-map size-full" />
      ) : (
        <div className="flex size-full items-center justify-center p-6 text-center text-sm text-dark-grey">
          Add NEXT_PUBLIC_MAPBOX_TOKEN to enable this map.
        </div>
      )}

      <FindMeWeatherBadge state={conditionsState} />

      <div className="pointer-events-none absolute top-0 z-10">
        <Image
          alt="Cloud"
          height={300}
          src="/images/cloud.png"
          width={300}
          className="cloud-one -translate-x-full -translate-y-32 opacity-90 contrast-125 transition-transform ease-in-out"
        />
        <Image
          alt="Cloud"
          height={240}
          src="/images/cloud.png"
          width={240}
          className="cloud-two -translate-x-full -translate-y-32 opacity-80 contrast-125 transition-transform ease-in-out"
        />
      </div>

      <div className="group absolute right-5 bottom-5 z-20 flex h-8 overflow-hidden">
        <Glass intensity={2} interactive radius={16} />
        <button
          aria-label="Zoom out"
          onClick={handleZoomOut}
          type="button"
          className="relative flex h-8 items-center justify-center px-2.5 text-black"
        >
          <Icon iconClassName="size-3" name="minus" />
        </button>
        <button
          aria-label="Zoom in"
          onClick={handleZoomIn}
          type="button"
          className="relative flex h-8 items-center justify-center px-2.5"
        >
          <Icon iconClassName="size-3" name="plus" />
        </button>
      </div>
      {mapFailed && (
        <p className="absolute top-16 left-5 z-20 rounded-md bg-white/80 px-2 py-1 text-xs">
          {`Map style failed: ${mapErrorMessage}`}
        </p>
      )}
    </Bento>
  );
}

export default memo(FindMe);
