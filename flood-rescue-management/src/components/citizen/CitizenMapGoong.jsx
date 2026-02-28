import React, { useEffect, useRef } from "react";
import goongjs from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";

const GOONG_MAPTILES_KEY = import.meta.env.VITE_GOONG_MAPTILES_KEY;

export default function CitizenMapGoong() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

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
      center: [105.8342, 21.0278], // Hà Nội
      zoom: 12,
    });

    mapRef.current = map;

    // TODO: thêm marker vị trí người dùng / điểm ngập, cứu hộ, cứu trợ

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
      {!GOONG_MAPTILES_KEY && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-sm font-semibold">
          Thiếu VITE_GOONG_MAPTILES_KEY trong file .env
        </div>
      )}
    </div>
  );
}
