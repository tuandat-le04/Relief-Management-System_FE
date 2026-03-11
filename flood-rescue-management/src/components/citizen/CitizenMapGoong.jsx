import React, { useEffect, useRef } from "react";
import goongjs from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";

const GOONG_MAPTILES_KEY = import.meta.env.VITE_GOONG_MAPTILES_KEY;

export default function CitizenMapGoong({ initialCoords, onSelectLocation }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!GOONG_MAPTILES_KEY) {
      console.warn("VITE_GOONG_MAPTILES_KEY chưa được cấu hình trong .env");
      return;
    }

    if (mapRef.current) return;

    goongjs.accessToken = GOONG_MAPTILES_KEY;

    const map = new goongjs.Map({
      container: mapContainerRef.current,
      style: "https://tiles.goong.io/assets/goong_map_web.json",
      center: initialCoords
        ? [initialCoords.longitude, initialCoords.latitude]
        : [106.6297, 10.8231], // TP.HCM
      zoom: initialCoords ? 15 : 12,
    });

    mapRef.current = map;

    // Khởi tạo marker nếu đã có tọa độ ban đầu
    if (initialCoords) {
      markerRef.current = new goongjs.Marker({ color: "#d22" })
        .setLngLat([initialCoords.longitude, initialCoords.latitude])
        .addTo(map);
    }

    const handleClick = (e) => {
      const { lng, lat } = e.lngLat;

      if (!markerRef.current) {
        markerRef.current = new goongjs.Marker({ color: "#d22" })
          .setLngLat([lng, lat])
          .addTo(map);
      } else {
        markerRef.current.setLngLat([lng, lat]);
      }

      if (onSelectLocation) {
        onSelectLocation({ latitude: lat, longitude: lng });
      }
    };

    map.on("click", handleClick);

    return () => {
      if (mapRef.current) {
        mapRef.current.off("click", handleClick);
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
    };
  }, [initialCoords, onSelectLocation]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full" />
      {!GOONG_MAPTILES_KEY && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-sm font-semibold">
          Thiếu VITE_GOONG_MAPTILES_KEY trong file .env
        </div>
      )}
    </div>
  );
}
