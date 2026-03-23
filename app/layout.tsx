import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ScoreDisplay from "@/components/ScoreDisplay";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Historicache — Discover History Near You",
  description: "Geocaching for historical sites. Explore, visit, and collect historic places.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="h-full flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased">
        <header className="shrink-0 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between z-50">
          <Link href="/" className="font-bold text-lg tracking-tight flex items-center gap-2 shrink-0">
            <span>🏛</span>
            <span className="hidden sm:inline">Historicache</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <ScoreDisplay />
                <Link
                  href="/add"
                  className="text-sm px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors whitespace-nowrap"
                >
                  <span className="sm:hidden">+</span>
                  <span className="hidden sm:inline">+ Add Site</span>
                </Link>
                <Link
                  href="/profile"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hidden sm:inline"
                >
                  Profile
                </Link>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="text-sm px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
              >
                Sign in
              </Link>
            )}
          </nav>
        </header>
        <main className="flex-1 min-h-0">{children}</main>
      </body>
    </html>
  );
}
