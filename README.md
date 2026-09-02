# Viaggio 🧭

A little map-based planner for our Italy road trip. Drop stops on a map, build a
route, and for each stop track the hotel, how many nights, notes, and a budget
that rolls up into a live trip total. Data syncs between two people via Supabase,
and it deploys as a static site to GitHub Pages.

## Features (phase 1)

- 🗺️ Pan/zoom map (OpenStreetMap — no API key, no billing)
- 📍 Click the map to drop a stop; stops connect into a route line
- 📋 Sidebar list of stops, reorderable, click to open & edit
- 🏨 Per-stop: name, arrival date, nights, hotel details, notes, **ZTL flag**
- 💶 Per-stop **and** trip-wide budget items → live **Total** and **Left to pay**
- 🔄 Realtime two-person sync (Supabase) with offline-friendly local cache
- 📱 Works on phone; installable-friendly layout for use during the trip

> **ZTL** = *Zona a Traffico Limitato*, Italy's limited-traffic city-center zones.
> Drive in without a permit and you get an automatic fine — so each stop has a
> checkbox to flag it.

## Tech

Vite + React + TypeScript · react-leaflet (OpenStreetMap) · Zustand (state +
localStorage) · Supabase (Postgres + Realtime + Auth).

## Run locally

```bash
npm install
npm run dev
```

Open the printed URL (default http://localhost:5173).

- Without Supabase env vars → **pure local mode** (localStorage only, no login).
- With `.env.local` present → login screen + realtime sync.

## Supabase setup (one time)

1. **Create the table & policies.** In the Supabase dashboard → **SQL editor**,
   paste and run [`supabase/schema.sql`](supabase/schema.sql).
2. **Turn on Realtime** for the `trips` table (the SQL does this; if it errored
   as "already member", you're fine).
3. **Auth redirect URLs.** Dashboard → **Authentication → URL Configuration** →
   add your dev URL (`http://localhost:5173`) and your GitHub Pages URL to
   *Redirect URLs*.
4. **Credentials.** Copy `.env.example` → `.env.local` and fill in your Project
   URL and the **publishable** (`sb_publishable_…`) key. Never use the
   `sb_secret_…` key or the DB password in the frontend.
5. **🔒 Lock it down before real use.** The starter policy lets *any* signed-in
   user read/write. Switch to the email allowlist at the bottom of
   `schema.sql` (put in your two emails) so only you and your wife have access.

### Sharing a trip

Both people point at the **same** `VITE_TRIP_ID` (default `shared-trip`) and sign
in with an allowlisted email. Edits stream live between devices; last write wins.

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Repo → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Repo → **Settings → Secrets and variables → Actions**:
   - Secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`
   - (optional) Variable: `VITE_TRIP_ID`
4. Push to `main` — the workflow in `.github/workflows/deploy.yml` builds and
   publishes automatically.

`vite.config.ts` uses `base: './'`, so it works at
`https://<user>.github.io/<repo>/` without extra config.

## How the data is stored

The whole trip is one JSON document (`Trip` in [`src/types.ts`](src/types.ts))
held in one Supabase row and mirrored to `localStorage`. That keeps sync trivial
for two people. If we ever outgrow it, the seam to normalize into per-entity
tables is [`src/hooks/useTripSync.ts`](src/hooks/useTripSync.ts).

## Roadmap ideas

- Real road routing + drive time/distance between stops (OSRM / OpenRouteService)
- Place search (Nominatim) instead of only click-to-drop
- PWA install + offline tiles for spotty mountain signal
- Drag-and-drop reordering; day-by-day itinerary view
