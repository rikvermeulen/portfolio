'use client';

import { memo, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

import { env } from '@/env.mjs';

import Icon from '@/components/Icons/Icon';

import { useSound } from '@/hooks/useSound';

import Bento from '../Bento';

mapboxgl.accessToken = env.NEXT_PUBLIC_MAPBOX_TOKEN;

function FindMe() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<null | mapboxgl.Map>(null);

  const latitude = 51.8738;
  const longitude = 5.07397;

  const { playSound } = useSound();

  useEffect(() => {
    if (mapContainerRef.current) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/rikvermeulen/cllbdz32d00tf01qp16b87izs',
        center: [longitude, latitude],
        zoom: 12,
        attributionControl: false,
        pitchWithRotate: false,
        dragRotate: false,
      });

      mapRef.current = map;

      const markerElement = document.createElement('div');
      const pingSpan = document.createElement('span');
      const innerSpan = document.createElement('span');

      pingSpan.classList.add(
        'ping',
        'absolute',
        'inline-flex',
        'h-6',
        'w-6',
        'rounded-full',
        'bg-[#007AFF]',
        'opacity-75',
      );
      innerSpan.classList.add(
        'relative',
        'inline-flex',
        'bg-[#007AFF]',
        'border-[3px]',
        'border-solid',
        'border-white',
        'h-6',
        'w-6',
        'rounded-full',
      );

      markerElement.appendChild(pingSpan);
      markerElement.appendChild(innerSpan);

      new mapboxgl.Marker(markerElement).setLngLat([longitude, latitude]).addTo(map);

      markerElement.setAttribute('aria-label', 'My location');

      map.scrollZoom.disable();
      map.doubleClickZoom.disable();
      map.boxZoom.disable();

      map.dragPan.disable();

      map.on('load', function () {
        map.resize();
      });

      const handleResize = () => {
        if (mapRef.current) {
          mapRef.current.resize();
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        map.remove();
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      if (currentZoom >= 12) return;
      playSound('tap');
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: currentZoom + 3,
        speed: 1,
        curve: 1,
      });
    }
  }, [mapRef, playSound]);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      playSound('tap');
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: currentZoom - 3,
        speed: 1,
        curve: 1,
      });
    }
  }, [mapRef, playSound]);

  return (
    <Bento size="1x1" className="bento relative z-0">
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      <div className="absolute top-0 z-10">
        <Image
          className=" cloud-one -translate-x-full -translate-y-32 contrast-125 transition-transform ease-in-out"
          src="/images/cloud.png"
          width={300}
          height={300}
          alt="cloud"
        />

        <Image
          className="cloud-two -translate-x-full -translate-y-32 contrast-125 transition-transform ease-in-out"
          src="/images/cloud.png"
          width={300}
          height={300}
          alt="cloud"
        />
      </div>
      <div className="group absolute bottom-5 right-5 z-50 flex">
        <button
          onClick={handleZoomOut}
          id="minus"
          aria-label="Minus - zoom out"
          className="rounded-s-xl bg-white/70 px-2 py-1.5 active:bg-slate-200/50"
        >
          <Icon
            type="minus"
            className="w-3 opacity-60 transition-opacity duration-300 group-hover:opacity-100"
          />
        </button>
        <button
          onClick={handleZoomIn}
          id="plus"
          aria-label="Plud - zoom in"
          className="rounded-e-xl bg-white/70 px-2 py-1.5 active:bg-slate-200/50"
        >
          <Icon
            type="plus"
            className="w-3 opacity-60 transition-opacity duration-300 group-hover:opacity-100"
          />
        </button>
      </div>
      <div className="absolute bottom-5 left-5 z-10 rounded-[8px] bg-white/70 px-2 py-1.5 shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06)] backdrop-blur-[20px]">
        <p className="text-xs text-dark_grey">Heukelum, The Netherlands 🏡</p>
      </div>
    </Bento>
  );
}

export default memo(FindMe);
