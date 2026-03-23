import { createClient } from "@/lib/supabase/server";
import MapWrapper from "@/components/MapWrapper";

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

  return (
    <div className="h-full">
      <MapWrapper sites={sitesResult.data ?? []} visitedIds={visitedIds} />
    </div>
  );
}
