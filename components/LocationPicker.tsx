"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = L.divIcon({
  html: `<svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22S28 24.5 28 14C28 6.268 21.732 0 14 0z" fill="#2f5d44"/>
    <circle cx="14" cy="14" r="6" fill="white" fill-opacity="0.9"/>
  </svg>`,
  className: "",
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -38],
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
          <Marker position={[selectedLat, selectedLng]} icon={markerIcon} />
          <PanTo lat={selectedLat} lng={selectedLng} />
        </>
      )}
    </MapContainer>
  );
}
