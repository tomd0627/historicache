import { Check, Landmark, Map as MapIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
          <h1 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100">Your Profile</h1>
          <p className="text-sm text-stone-400 mt-0.5 truncate max-w-50 sm:max-w-none">{user.email}</p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>

      {/* Score card */}
      <div className="bg-stone-100 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-2xl p-6 mb-8 text-center">
        <p className="text-5xl font-bold text-forest-600 dark:text-forest-400">{score}</p>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">total points</p>
        <p className="text-xs text-stone-400 mt-2">
          {visitedSites.length} {visitedSites.length === 1 ? "site" : "sites"} visited
        </p>
      </div>

      {/* Visited sites list */}
      <h2 className="font-serif font-semibold text-lg mb-4 text-stone-800 dark:text-stone-200">Collected Sites</h2>

      {visitedSites.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <MapIcon size={32} strokeWidth={1.5} className="mx-auto mb-3 text-stone-400" />
          <p>No sites collected yet.</p>
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium px-4 py-1.5 rounded-full bg-forest-600 hover:bg-forest-700 text-white mt-3 transition-colors">
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
                  className="flex items-center gap-4 p-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-forest-300 dark:hover:border-forest-700 transition-colors"
                >
                  {site.photo_url ? (
                    <Image
                      src={site.photo_url}
                      alt={site.name}
                      width={56}
                      height={56}
                      className="rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-stone-100 dark:bg-stone-800 shrink-0 flex items-center justify-center text-stone-400">
                      <Landmark size={24} strokeWidth={1.5} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium truncate text-stone-800 dark:text-stone-200">{site.name}</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {new Date(checkin.checked_in_at).toLocaleDateString()} · {site.points_value} pts
                    </p>
                  </div>
                  <Check size={16} strokeWidth={2.5} className="ml-auto text-forest-500 shrink-0" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
