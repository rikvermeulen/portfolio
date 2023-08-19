'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

import { env } from 'env.mjs';

import Icon from '@/components/Icons/Icon';

import Bento from '../Bento';

mapboxgl.accessToken = env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function FindMe() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<null | mapboxgl.Map>(null);

  const latitude = 51.8738;
  const longitude = 5.07397;

  useEffect(() => {
    if (mapContainerRef.current) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/rikvermeulen/cllbdz32d00tf01qp16b87izs',
        center: [longitude, latitude],
        zoom: 12,
        attributionControl: false,
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
        'bg-[#729AF8]',
        'opacity-75',
      );
      innerSpan.classList.add(
        'relative',
        'inline-flex',
        'bg-[#729AF8]',
        'border-2',
        'border-solid',
        'border-white',
        'h-6',
        'w-6',
        'rounded-full',
      );

      markerElement.appendChild(pingSpan);
      markerElement.appendChild(innerSpan);

      new mapboxgl.Marker(markerElement).setLngLat([longitude, latitude]).addTo(map);

      map.scrollZoom.disable();
      map.doubleClickZoom.disable();
      map.boxZoom.disable();

      map.dragPan.disable();

      return () => {
        map.remove();
      };
    }
  }, []);

  function handleZoomIn() {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      if (currentZoom >= 12) return;
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: currentZoom + 3,
        speed: 1,
        curve: 1,
      });
    }
  }

  function handleZoomOut() {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: currentZoom - 3,
        speed: 1,
        curve: 1,
      });
    }
  }

  return (
    <Bento size="1x1" className="bento relative z-0">
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      <div className="absolute top-0 z-10">
        <Image
          className=" cloud-one -translate-x-full -translate-y-32 transition-transform duration-[3s]"
          src="/images/cloud.png"
          width={300}
          height={300}
          alt="cloud"
        />

        <Image
          className="cloud-two -translate-x-full -translate-y-32 transition-transform duration-[4s]"
          src="/images/cloud.png"
          width={300}
          height={300}
          alt="cloud"
        />
      </div>
      <div className="group absolute bottom-5 right-5 z-50 flex gap-3 rounded-xl bg-white/70 px-2 py-1">
        <button onClick={handleZoomOut}>
          <Icon
            type="minus"
            className="w-2 opacity-60 transition-opacity duration-300 group-hover:opacity-100"
          />
        </button>
        <button onClick={handleZoomIn}>
          <Icon
            type="plus"
            className="w-2 opacity-60 transition-opacity duration-300 group-hover:opacity-100"
          />
        </button>
      </div>
      <div className="absolute bottom-5 left-5 z-10 rounded border border-solid border-[#e8e8e8] bg-white/70 p-1.5 drop-shadow-sm backdrop-blur-xl">
        <p className="text-[10px] text-dark_grey">Heukelum, The Netherlands 🏡</p>
      </div>
    </Bento>
  );
}
