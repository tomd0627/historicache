import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CheckInButton from "@/components/CheckInButton";
import DeleteSiteButton from "@/components/DeleteSiteButton";
import NavigateSection from "@/components/NavigateSection";
import { createClient } from "@/lib/supabase/server";

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
      <Link href="/" className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 mb-6 transition-colors">
        ← Back to map
      </Link>

      {site.photo_url && (
        <div className="relative rounded-2xl overflow-hidden mb-6 aspect-video bg-stone-100 dark:bg-stone-800">
          <Image
            src={site.photo_url}
            alt={site.name}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100">{site.name}</h1>
        <span className="shrink-0 text-sm font-semibold bg-forest-100 dark:bg-forest-900/40 text-forest-700 dark:text-forest-300 px-3 py-1 rounded-full">
          {site.points_value} pts
        </span>
      </div>

      {site.description && (
        <p className="text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
          {site.description}
        </p>
      )}

      {site.ai_history && site.ai_history !== site.description && (
        <div className="mb-6 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2 uppercase tracking-wide">AI-generated history</p>
          <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-sm">{site.ai_history}</p>
        </div>
      )}

      <div className="text-xs text-stone-400 mb-8">
        📍 {site.lat.toFixed(5)}, {site.lng.toFixed(5)}
      </div>

      {user ? (
        <div className="flex flex-col gap-3">
          <NavigateSection site={site} />
          <CheckInButton site={site} alreadyVisited={alreadyVisited} />
          {site.created_by === user.id && (
            <DeleteSiteButton siteId={site.id} />
          )}
        </div>
      ) : (
        <Link
          href={`/auth/login?next=/sites/${site.id}`}
          className="block w-full py-3 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-semibold text-center transition-colors"
        >
          Sign in to check in
        </Link>
      )}
    </div>
  );
}
