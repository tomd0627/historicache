"use client";

import dynamic from "next/dynamic";
import type { Site } from "@/lib/supabase/types";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <p className="text-gray-500">Loading map…</p>
    </div>
  ),
});

type Props = {
  sites: Site[];
  visitedIds: Set<string>;
};

export default function MapWrapper({ sites, visitedIds }: Props) {
  return <MapView sites={sites} visitedIds={visitedIds} />;
}
