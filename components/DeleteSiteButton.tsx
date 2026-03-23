"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
        <p className="text-sm text-gray-500 text-center">Are you sure? This cannot be undone.</p>
        <div className="flex gap-2">
          <button
            onClick={() => setConfirming(false)}
            disabled={loading}
            className="flex-1 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-medium disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium disabled:opacity-60"
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
      onClick={() => setConfirming(true)}
      className="w-full py-2 rounded-xl border border-red-300 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors"
    >
      Delete site
    </button>
  );
}
