"use client";

import { Compass } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ScoreDisplay() {
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function fetchScore() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("total_score")
        .eq("id", user.id)
        .single();

      setScore(data?.total_score ?? 0);
    }

    fetchScore();

    const channel = supabase
      .channel("profile-score")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
          setScore((payload.new as { total_score: number }).total_score);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (score === null) return null;

  return (
    <span className="flex items-center gap-1.5 bg-forest-100 text-forest-800 dark:bg-forest-900/40 dark:text-forest-200 px-3 py-1 rounded-full text-sm font-semibold">
      <Compass size={14} strokeWidth={2} />
      <span>{score} pts</span>
    </span>
  );
}
