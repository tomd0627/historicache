"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DeleteSiteButton({ siteId }: { siteId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("sites").delete().eq("id", siteId);
    if (error) {
      setError("Delete failed. Please try again.");
      setLoading(false);
      setConfirming(false);
      return;
    }
    router.push("/");
  }

  if (confirming) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-stone-500 text-center">Are you sure? This cannot be undone.</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={loading}
            className="flex-1 py-3 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors disabled:opacity-60"
          >
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="w-full py-3 rounded-xl border border-red-300 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold transition-colors"
    >
      Delete Site
    </button>
  );
}
