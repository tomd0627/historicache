"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
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
const demoIcon = pinIcon("#b45309");      // amber-700

const SESSION_KEY = "hc_map_viewport";

function getStoredViewport(): { center: [number, number]; zoom: number } | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function ViewportSaver() {
  useMapEvents({
    moveend(e) {
      const c = e.target.getCenter();
      const z = e.target.getZoom();
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ center: [c.lat, c.lng], zoom: z }));
      } catch { /* quota exceeded or private browsing — ignore */ }
    },
  });
  return null;
}

function LocateButton() {
  const map = useMap();
  const [denied, setDenied] = useState(false);

  function locate() {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        map.setView([pos.coords.latitude, pos.coords.longitude], 13);
      },
      () => {
        setDenied(true);
        setTimeout(() => setDenied(false), 3000);
      }
    );
  }
  return (
    <div className="leaflet-bottom leaflet-right" style={{ marginBottom: "80px" }}>
      <div className="leaflet-control leaflet-bar">
        <button
          type="button"
          onClick={locate}
          title="Go to my location"
          aria-label="Go to my location"
          className="flex items-center justify-center w-7.5 h-7.5 bg-white dark:bg-stone-800 dark:text-white cursor-pointer border-none"
        >
          <LocateFixed size={16} strokeWidth={1.75} />
        </button>
        {denied && (
          <div className="absolute bottom-10 right-0 whitespace-nowrap text-xs bg-stone-800 text-white px-2 py-1 rounded shadow">
            Location access denied
          </div>
        )}
      </div>
    </div>
  );
}

type Props = {
  sites: Site[];
  visitedIds: Set<string>;
  defaultCenter?: [number, number];
  defaultZoom?: number;
};

export default function MapView({ sites, visitedIds, defaultCenter, defaultZoom }: Props) {
  const [viewport] = useState(() => {
    // Only restore from sessionStorage when no explicit default is provided (logged-in users).
    // Anonymous users always receive defaultCenter/defaultZoom (DC), so we skip sessionStorage
    // to avoid showing a stale position from a previous logged-in session.
    const stored = defaultCenter == null ? getStoredViewport() : null;
    return {
      center: (stored?.center ?? defaultCenter ?? [39.5, -98.35]) as [number, number],
      zoom: stored?.zoom ?? defaultZoom ?? 4,
    };
  });

  return (
    <MapContainer
      center={viewport.center}
      zoom={viewport.zoom}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ViewportSaver />
      <LocateButton />
      {sites.map((site) => (
        <Marker
          key={site.id}
          position={[site.lat, site.lng]}
          icon={visitedIds.has(site.id) ? visitedIcon : site.is_demo ? demoIcon : unvisitedIcon}
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
                <p className="font-semibold text-base text-stone-800 dark:text-stone-100 leading-tight mb-2">{site.name}</p>
                {site.is_demo && (
                  <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-800/40 text-amber-700 dark:text-amber-300 mb-2">Demo site</span>
                )}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-forest-100 dark:bg-forest-700/50 text-forest-700 dark:text-forest-100">{site.points_value} pts</span>
                  {!site.is_demo && (
                    <Link
                      href={`/sites/${site.id}`}
                      className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full border border-forest-600 text-forest-700 dark:text-forest-300 hover:bg-forest-50 dark:hover:bg-forest-900/40 transition-colors"
                    >
                      View details →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
