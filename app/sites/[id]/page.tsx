import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CheckInButton from "@/components/CheckInButton";
import Link from "next/link";

type Props = { params: Promise<{ id: string }> };

export default async function SitePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: site }, { data: { user } }] = await Promise.all([
    supabase.from("sites").select("*").eq("id", id).single(),
    supabase.auth.getUser(),
  ]);

  if (!site) notFound();

  let alreadyVisited = false;
  if (user) {
    const { data } = await supabase
      .from("checkins")
      .select("id")
      .eq("user_id", user.id)
      .eq("site_id", id)
      .single();
    alreadyVisited = !!data;
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-6 inline-block">
        ← Back to map
      </Link>

      {site.photo_url && (
        <div className="rounded-2xl overflow-hidden mb-6 aspect-video bg-gray-100 dark:bg-gray-800">
          <img
            src={site.photo_url}
            alt={site.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold">{site.name}</h1>
        <span className="shrink-0 text-sm font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full">
          {site.points_value} pts
        </span>
      </div>

      {site.description && (
        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          {site.description}
        </p>
      )}

      <div className="text-xs text-gray-400 mb-8">
        📍 {site.lat.toFixed(5)}, {site.lng.toFixed(5)}
      </div>

      {user ? (
        <CheckInButton site={site} alreadyVisited={alreadyVisited} />
      ) : (
        <Link
          href={`/auth/login?next=/sites/${site.id}`}
          className="block w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-center transition-colors"
        >
          Sign in to check in
        </Link>
      )}
    </div>
  );
}
