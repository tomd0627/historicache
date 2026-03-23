"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Site } from "@/lib/supabase/types";

const goldIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type Props = {
  site: Site;
  userPos: [number, number] | null;
};

function FitBounds({ site, userPos }: Props) {
  const map = useMap();
  const hasFit = useRef(false);

  useEffect(() => {
    if (userPos && !hasFit.current) {
      hasFit.current = true;
      map.fitBounds([[site.lat, site.lng], userPos], { padding: [40, 40] });
    }
  }, [map, site.lat, site.lng, userPos]);

  return null;
}

export default function NavigateMap({ site, userPos }: Props) {
  return (
    <MapContainer
      center={[site.lat, site.lng]}
      zoom={15}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds site={site} userPos={userPos} />
      <Marker position={[site.lat, site.lng]} icon={goldIcon} />
      {userPos && (
        <CircleMarker
          center={userPos}
          radius={10}
          pathOptions={{
            color: "#1d4ed8",
            fillColor: "#3b82f6",
            fillOpacity: 0.9,
            weight: 2,
          }}
        />
      )}
    </MapContainer>
  );
}
