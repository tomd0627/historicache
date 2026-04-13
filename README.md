# Historicache

Geocaching for historical sites. Browse a map, visit sites in person, check in with GPS, and earn points as you build your collection.

## Features

- Demo mode — pre-seeded DC sites load instantly so you can explore without GPS or an account
- Interactive map showing all historical sites (OpenStreetMap, no API key needed)
- Map viewport persists across navigation — returns to where you left off
- GPS proximity check-in — must be within 100m of a site to collect it
- Turn-by-turn navigation to any site with live distance tracking
- AI image identification — upload a photo and the site name, description, and coordinates are pre-filled
- Photo uploads stored in Supabase Storage
- Magic link authentication (no passwords)
- Real-time score display that updates after each check-in
- Sign in to add new sites near you
- Dark mode

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Supabase](https://supabase.com) — auth, Postgres database, file storage
- [React Leaflet](https://react-leaflet.js.org) — interactive maps
- [Claude API](https://anthropic.com) — historical site identification from photos

## Getting started

### 1. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. In the SQL editor, run the contents of [`supabase-schema.sql`](./supabase-schema.sql) to create the tables, RLS policies, and RPC function
3. In **Storage**, create a public bucket named `site-photos` and add an upload policy for authenticated users

### 2. Configure auth redirects

In your Supabase dashboard → **Authentication → URL Configuration**, add to allowed redirect URLs:

```
http://localhost:3000/auth/callback
https://your-production-domain.com/auth/callback
```

### 3. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in your Supabase project URL and anon key (found in **Project Settings → API**), and your Anthropic API key.

### 4. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment (Netlify)

1. Push to GitHub
2. Import the repo in Netlify
3. Add the environment variables from `.env.local` to Netlify's environment settings
4. Deploy

## Project structure

```
app/
  page.tsx                   # Home — full-screen map
  layout.tsx                 # Root layout — header, theme provider
  sites/[id]/page.tsx        # Site detail, check-in, and navigation
  add/page.tsx               # Add a new site
  profile/page.tsx           # Your score and visited sites
  auth/
    login/page.tsx           # Magic link login
    callback/route.ts        # Supabase auth callback
  api/
    identify-site/route.ts   # Claude vision endpoint — identifies site from photo
components/
  MapView.tsx                # React Leaflet map with demo/visited/unvisited pins
  MapWrapper.tsx             # Dynamic import wrapper (SSR disabled)
  LocationPicker.tsx         # Click-to-pin map for site creation
  NavigateSection.tsx        # Navigate-to-site UI with live distance
  NavigateMap.tsx            # Leaflet map used during navigation
  NavigateMapWrapper.tsx     # Dynamic import wrapper for NavigateMap
  CheckInButton.tsx          # GPS proximity check + Supabase insert
  AddSiteForm.tsx            # New site form with photo upload and AI identification
  ScoreDisplay.tsx           # Live score chip in the header
  DeleteSiteButton.tsx       # Owner-only site deletion
  UserMenu.tsx               # Sign in / sign out menu
  ThemeToggle.tsx            # Light/dark mode toggle
  ThemeProvider.tsx          # next-themes provider
lib/
  supabase/                  # Typed browser + server Supabase clients and types
  geo.ts                     # Haversine distance calculation
  demo-sites.ts              # Pre-seeded DC sites shown to anonymous visitors
proxy.ts                     # Middleware — route protection for /add and /profile
supabase-schema.sql          # Full database schema — run this in Supabase
```
