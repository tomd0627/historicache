"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function ClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function AutoCenter() {
  const map = useMap();
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      map.setView([pos.coords.latitude, pos.coords.longitude], 14);
    });
  }, [map]);
  return null;
}

function PanTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const hasPanned = useRef(false);
  useEffect(() => {
    if (!hasPanned.current) {
      hasPanned.current = true;
      map.setView([lat, lng], 15);
    }
  }, [map, lat, lng]);
  return null;
}

type Props = {
  onSelect: (lat: number, lng: number) => void;
  selectedLat: number | null;
  selectedLng: number | null;
};

export default function LocationPicker({ onSelect, selectedLat, selectedLng }: Props) {
  return (
    <MapContainer center={[51.505, -0.09]} zoom={4} className="h-full w-full" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <AutoCenter />
      <ClickHandler onSelect={onSelect} />
      {selectedLat !== null && selectedLng !== null && (
        <>
          <Marker position={[selectedLat, selectedLng]} />
          <PanTo lat={selectedLat} lng={selectedLng} />
        </>
      )}
    </MapContainer>
  );
}
