"use client";

import dynamic from "next/dynamic";
import type { Site } from "@/lib/supabase/types";

const NavigateMap = dynamic(() => import("./NavigateMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-stone-100 dark:bg-stone-800">
      <p className="text-stone-500">Loading map…</p>
    </div>
  ),
});

type Props = {
  site: Site;
  userPos: [number, number] | null;
};

export default function NavigateMapWrapper({ site, userPos }: Props) {
  return <NavigateMap site={site} userPos={userPos} />;
}
