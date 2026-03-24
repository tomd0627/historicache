"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { Site } from "@/lib/supabase/types";

function pinIcon(color: string) {
  return L.divIcon({
    html: `<svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22S28 24.5 28 14C28 6.268 21.732 0 14 0z" fill="${color}"/>
      <circle cx="14" cy="14" r="6" fill="white" fill-opacity="0.9"/>
    </svg>`,
    className: "",
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -38],
  });
}

const visitedIcon = pinIcon("#2f5d44");   // forest-600
const unvisitedIcon = pinIcon("#a8a29e"); // stone-400

function LocateButton() {
  const map = useMap();
  function locate() {
    navigator.geolocation?.getCurrentPosition((pos) => {
      map.setView([pos.coords.latitude, pos.coords.longitude], 13);
    });
  }
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      map.setView([pos.coords.latitude, pos.coords.longitude], 13);
    });
  }, [map]);
  return (
    <div className="leaflet-bottom leaflet-right" style={{ marginBottom: "80px" }}>
      <div className="leaflet-control leaflet-bar">
        <button
          type="button"
          onClick={locate}
          title="Go to my location"
          aria-label="Go to my location"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "30px",
            height: "30px",
            background: "white",
            cursor: "pointer",
            border: "none",
            fontSize: "16px",
          }}
        >
          <LocateFixed size={16} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
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
      <LocateButton />
      {sites.map((site) => (
        <Marker
          key={site.id}
          position={[site.lat, site.lng]}
          icon={visitedIds.has(site.id) ? visitedIcon : unvisitedIcon}
        >
          <Popup minWidth={200}>
            <div className="w-52">
              {site.photo_url && (
                <Image
                  src={site.photo_url}
                  alt={site.name}
                  width={208}
                  height={112}
                  sizes="208px"
                  className="w-full object-cover"
                />
              )}
              <div className="px-3 py-2.5">
                <p className="font-semibold text-sm text-stone-800 leading-tight mb-2">{site.name}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-forest-100 text-forest-700">{site.points_value} pts</span>
                  <Link
                    href={`/sites/${site.id}`}
                    className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full border border-forest-600 text-forest-700 hover:bg-forest-50 transition-colors"
                  >
                    View details →
                  </Link>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
