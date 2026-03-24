"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { distanceMeters } from "@/lib/geo";
import { createClient } from "@/lib/supabase/client";
import type { Site } from "@/lib/supabase/types";

const CHECKIN_RADIUS_M = 100;

type Props = {
  site: Site;
  alreadyVisited: boolean;
};

export default function CheckInButton({ site, alreadyVisited }: Props) {
  const [visited, setVisited] = useState(alreadyVisited);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleCheckIn() {
    setStatus("loading");
    setMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const dist = distanceMeters(
          pos.coords.latitude,
          pos.coords.longitude,
          site.lat,
          site.lng
        );

        if (dist > CHECKIN_RADIUS_M) {
          setStatus("error");
          setMessage(
            `You're ${Math.round(dist)}m away — get within ${CHECKIN_RADIUS_M}m to check in!`
          );
          return;
        }

        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setStatus("error");
          setMessage("You must be logged in to check in.");
          return;
        }

        const { error: insertError } = await supabase
          .from("checkins")
          .insert({ user_id: user.id, site_id: site.id });

        if (insertError) {
          setStatus("error");
          setMessage("Check-in failed. Please try again.");
          return;
        }

        const { error: rpcError } = await supabase.rpc("increment_score", {
          p_user_id: user.id,
          p_amount: site.points_value,
        });

        if (rpcError) {
          console.error("Score update failed:", rpcError);
        }

        setVisited(true);
        setStatus("success");
        setMessage(`+${site.points_value} points earned!`);
      },
      () => {
        setStatus("error");
        setMessage("Location access denied. Enable GPS to check in.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  if (visited) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="w-full py-3 rounded-xl bg-forest-100 dark:bg-forest-700/50 text-forest-700 dark:text-forest-100 font-semibold text-center">
          <Check size={16} strokeWidth={2.5} className="inline mr-1.5" />Visited
        </div>
        {message && status === "success" && (
          <p className="text-sm text-forest-600 dark:text-forest-400">{message}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleCheckIn}
        disabled={status === "loading"}
        className="w-full py-3 rounded-xl bg-forest-600 hover:bg-forest-700 active:bg-forest-800 text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Locating you…" : "Check In Here"}
      </button>
      {message && (
        <p
          className={`text-sm text-center ${
            status === "error"
              ? "text-red-600 dark:text-red-400"
              : "text-forest-600 dark:text-forest-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
