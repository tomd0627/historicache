import Link from "next/link";
import MapWrapper from "@/components/MapWrapper";
import { DC_CENTER, DC_ZOOM, DEMO_SITES } from "@/lib/demo-sites";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const [sitesResult, { data: { user } }] = await Promise.all([
    supabase.from("sites").select("*").order("created_at", { ascending: false }),
    supabase.auth.getUser(),
  ]);

  let visitedIds = new Set<string>();
  if (user) {
    const { data: checkins } = await supabase
      .from("checkins")
      .select("site_id")
      .eq("user_id", user.id);
    visitedIds = new Set(checkins?.map((c) => c.site_id) ?? []);
  }

  const realSites = sitesResult.data ?? [];
  const sites = user ? realSites : [...DEMO_SITES, ...realSites];

  return (
    <div className="h-full flex flex-col">
      {!user && (
        <div className="shrink-0 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2 text-xs text-amber-700 dark:text-amber-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
          <span>Browsing demo sites in Washington DC — no GPS needed to explore. Location is only used when checking in.</span>
          <Link href="/auth/login?next=/add" className="shrink-0 font-semibold underline underline-offset-2 whitespace-nowrap">
            Know a hidden gem? Add it →
          </Link>
        </div>
      )}
      <div className="flex-1 min-h-0">
        <MapWrapper
          sites={sites}
          visitedIds={visitedIds}
          defaultCenter={user ? undefined : DC_CENTER}
          defaultZoom={user ? undefined : DC_ZOOM}
        />
      </div>
    </div>
  );
}
