"use client";

import { useState, useEffect, useRef } from "react";
import NavigateMapWrapper from "./NavigateMapWrapper";
import { distanceMeters } from "@/lib/geo";
import type { Site } from "@/lib/supabase/types";

type Props = { site: Site };

export default function NavigateSection({ site }: Props) {
  const [navigating, setNavigating] = useState(false);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  function startNavigation() {
    setNavigating(true);
    setGpsError(false);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(coords);
        setDistance(distanceMeters(pos.coords.latitude, pos.coords.longitude, site.lat, site.lng));
      },
      () => { setGpsError(true); stopNavigation(); },
      { enableHighAccuracy: true }
    );
  }

  function stopNavigation() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setNavigating(false);
    setUserPos(null);
    setDistance(null);
  }

  // Clean up watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  if (!navigating) {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={startNavigation}
          className="w-full py-3 rounded-xl border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
        >
          Navigate to Site
        </button>
        {gpsError && (
          <p className="text-sm text-center text-red-600 dark:text-red-400">
            Location access denied. Enable GPS to navigate.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl overflow-hidden h-64">
        <NavigateMapWrapper site={site} userPos={userPos} />
      </div>
      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
          {distance === null
            ? "Acquiring location…"
            : distance < 100
            ? `${Math.round(distance)}m away — you're close!`
            : `${Math.round(distance)}m to go`}
        </p>
        <button
          type="button"
          onClick={stopNavigation}
          className="text-sm text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
        >
          Stop
        </button>
      </div>
    </div>
  );
}
