import Link from "next/link";
import AddSiteForm from "@/components/AddSiteForm";

export default function AddSitePage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 mb-6 transition-colors">
        ← Back to map
      </Link>
      <h1 className="font-serif text-2xl font-semibold mb-6 text-stone-900 dark:text-stone-100">Add a Historical Site</h1>
      <AddSiteForm />
    </div>
  );
}
