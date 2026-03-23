import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/profile");

  const [{ data: profile }, { data: checkins }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("checkins")
      .select("*, sites(*)")
      .eq("user_id", user.id)
      .order("checked_in_at", { ascending: false }),
  ]);

  const score = profile?.total_score ?? 0;
  const visitedSites = checkins ?? [];

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Your Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Sign out
          </button>
        </form>
      </div>

      {/* Score card */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-8 text-center">
        <p className="text-5xl font-bold text-amber-600 dark:text-amber-400">{score}</p>
        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">total points</p>
        <p className="text-xs text-amber-500 mt-2">
          {visitedSites.length} {visitedSites.length === 1 ? "site" : "sites"} visited
        </p>
      </div>

      {/* Visited sites list */}
      <h2 className="font-semibold text-lg mb-4">Collected Sites</h2>

      {visitedSites.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-3xl mb-3">🗺</p>
          <p>No sites collected yet.</p>
          <Link href="/" className="text-amber-500 hover:underline text-sm mt-2 inline-block">
            Explore the map →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {visitedSites.map((checkin) => {
            const site = (checkin as unknown as { sites: { id: string; name: string; points_value: number; photo_url: string | null } | null }).sites;
            if (!site) return null;
            return (
              <li key={checkin.id}>
                <Link
                  href={`/sites/${site.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
                >
                  {site.photo_url ? (
                    <img
                      src={site.photo_url}
                      alt={site.name}
                      className="w-14 h-14 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0 flex items-center justify-center text-xl">
                      🏛
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium truncate">{site.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(checkin.checked_in_at).toLocaleDateString()} · {site.points_value} pts
                    </p>
                  </div>
                  <span className="ml-auto text-green-500 shrink-0">✓</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
