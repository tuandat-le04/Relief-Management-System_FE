import React, { useEffect, useRef } from "react";
import goongjs from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";

const GOONG_MAPTILES_KEY = import.meta.env.VITE_GOONG_MAPTILES_KEY;

const isFiniteNumber = (value) => Number.isFinite(Number(value));

export default function AssignedMissionMapGoong({ latitude, longitude, onMapReady }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Init map once
  useEffect(() => {
    if (!containerRef.current) return;
    if (!GOONG_MAPTILES_KEY) {
      console.warn("VITE_GOONG_MAPTILES_KEY chưa được cấu hình trong .env");
      return;
    }
    if (mapRef.current) return;

    goongjs.accessToken = GOONG_MAPTILES_KEY;

    const hasCoords = isFiniteNumber(latitude) && isFiniteNumber(longitude);
    const center = hasCoords
      ? [Number(longitude), Number(latitude)]
      : [106.6297, 10.8231]; // TP.HCM

    const map = new goongjs.Map({
      container: containerRef.current,
      style: "https://tiles.goong.io/assets/goong_map_web.json",
      center,
      zoom: hasCoords ? 15 : 12,
    });

    mapRef.current = map;

    // Expose map instance after style is ready
    const handleLoad = () => {
      onMapReady?.(map);
    };
    if (map.loaded()) {
      handleLoad();
    } else {
      map.once("load", handleLoad);
    }

    return () => {
      onMapReady?.(null);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update marker/center when coords change
  useEffect(() => {
    if (!mapRef.current) return;

    const hasCoords = isFiniteNumber(latitude) && isFiniteNumber(longitude);
    if (!hasCoords) return;

    const lngLat = [Number(longitude), Number(latitude)];

    if (!markerRef.current) {
      markerRef.current = new goongjs.Marker({ color: "#dc2626" })
        .setLngLat(lngLat)
        .addTo(mapRef.current);
    } else {
      markerRef.current.setLngLat(lngLat);
    }

    mapRef.current.flyTo({
      center: lngLat,
      zoom: 15,
      speed: 1.2,
      curve: 1.2,
    });
  }, [latitude, longitude]);

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />
      {!GOONG_MAPTILES_KEY && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-sm font-semibold">
          Thiếu VITE_GOONG_MAPTILES_KEY trong file .env
        </div>
      )}
    </div>
  );
}
