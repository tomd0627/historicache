"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import type { Site } from "@/lib/supabase/types";

// Fix default icon paths broken by webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const goldIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const greyIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function LocationCenter() {
  const map = useMap();
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      map.setView([pos.coords.latitude, pos.coords.longitude], 13);
    });
  }, [map]);
  return null;
}

type Props = {
  sites: Site[];
  visitedIds: Set<string>;
};

export default function MapView({ sites, visitedIds }: Props) {
  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={5}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationCenter />
      {sites.map((site) => (
        <Marker
          key={site.id}
          position={[site.lat, site.lng]}
          icon={visitedIds.has(site.id) ? goldIcon : greyIcon}
        >
          <Popup>
            <div className="min-w-[160px]">
              {site.photo_url && (
                <img
                  src={site.photo_url}
                  alt={site.name}
                  className="w-full h-24 object-cover rounded mb-2"
                />
              )}
              <p className="font-semibold text-sm">{site.name}</p>
              <p className="text-xs text-gray-500 mb-2">{site.points_value} pts</p>
              <Link
                href={`/sites/${site.id}`}
                className="text-xs text-amber-600 font-medium hover:underline"
              >
                View details →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
