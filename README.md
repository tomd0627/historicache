# Historicache

Geocaching for historical sites. Browse a map, visit sites in person, check in with GPS, and earn points as you build your collection.

## Features

- Interactive map showing all historical sites (OpenStreetMap, no API key needed)
- GPS proximity check-in — must be within 100m of a site to collect it
- Photo uploads for each site stored in Supabase Storage
- Magic link authentication (no passwords)
- Real-time score display that updates after each check-in
- Anyone can add new sites

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Supabase](https://supabase.com) — auth, Postgres database, file storage
- [React Leaflet](https://react-leaflet.js.org) — interactive maps

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

Fill in your Supabase project URL and anon key (found in **Project Settings → API**).

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
  page.tsx              # Home — full-screen map
  sites/[id]/page.tsx   # Site detail + check-in
  add/page.tsx          # Add a new site
  profile/page.tsx      # Your score and visited sites
  auth/
    login/page.tsx      # Magic link login
    callback/route.ts   # Supabase OAuth callback
components/
  MapView.tsx           # React Leaflet map
  MapWrapper.tsx        # Client wrapper for dynamic import
  LocationPicker.tsx    # Click-to-pin map for site creation
  CheckInButton.tsx     # GPS proximity check + Supabase insert
  AddSiteForm.tsx       # New site form with photo upload
  ScoreDisplay.tsx      # Live score chip in the header
lib/
  supabase/             # Typed browser + server Supabase clients
  geo.ts                # Haversine distance calculation
proxy.ts                # Route protection for /add and /profile
supabase-schema.sql     # Full database schema — run this in Supabase
```
