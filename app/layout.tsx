import { Compass } from "lucide-react";
import type { Metadata } from "next";
import { Geist, Lora } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import { ThemeProvider } from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
import ScoreDisplay from "@/components/ScoreDisplay";
import UserMenu from "@/components/UserMenu";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });

export const metadata: Metadata = {
  title: "HistoriCache — Discover History Near You",
  description: "Geocaching for historical sites. Explore, visit, and collect historic places.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" className={`${geist.variable} ${lora.variable} h-full`} suppressHydrationWarning>
      <body className="h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] antialiased">
        {/* Prevent flash of wrong theme before React hydrates */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          src="/theme-init.js"
        />
        <ThemeProvider>
          <header className="shrink-0 border-b border-stone-200 dark:border-stone-800 bg-[var(--background)] px-4 py-3 flex items-center justify-between z-50">
            <Link href="/" aria-label="HistoriCache home" className="flex items-center gap-2 shrink-0 group">
              <Compass size={20} strokeWidth={1.75} />
              <span className="hidden sm:inline font-serif font-semibold text-lg tracking-tight text-stone-800 dark:text-stone-100 group-hover:text-forest-600 dark:group-hover:text-forest-400 transition-colors">
                HistoriCache
              </span>
            </Link>
            <nav className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              {user ? (
                <>
                  <ScoreDisplay />
                  <Link
                    href="/add"
                    className="text-sm px-3 py-1.5 rounded-lg bg-forest-600 hover:bg-forest-700 text-white font-medium transition-colors whitespace-nowrap"
                  >
                    <span className="sm:hidden">+</span>
                    <span className="hidden sm:inline">+ Add Site</span>
                  </Link>
                  <UserMenu email={user.email ?? ""} />
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="text-sm px-3 py-1.5 rounded-lg bg-forest-600 hover:bg-forest-700 text-white font-medium transition-colors"
                >
                  Sign in
                </Link>
              )}
            </nav>
          </header>
          <main className="flex-1 min-h-0">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
