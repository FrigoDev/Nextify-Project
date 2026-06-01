# **Nextify Project - Final Project - Applaudo Trainee Program**

This repository is my version of the Spotify website, using the [Spotify Web API](https://developer.spotify.com/documentation/web-api) and [Next.js](https://nextjs.org/). It is a responsive site that lets users log in with their Spotify account and browse their library, playlists, albums, artists and tracks. Built with React + TypeScript, SSR, hooks and Tailwind.

> **Note (2026):** This project was originally built in 2023. It has since been modernized — upgraded to Next.js 15 and patched against all known dependency vulnerabilities — and adapted to the Spotify Web API restrictions introduced in November 2024 and February 2026 (see [Known limitations](#known-limitations-spotify-api-changes)).

## Tech stack

- Next.js 15 (Pages Router) + React 18 + TypeScript
- NextAuth (Spotify OAuth) with JWT sessions and token refresh
- Redux / Rematch + redux-persist
- Tailwind CSS
- Vitest + Testing Library

## Prerequisites: Spotify Developer Dashboard

Because the app runs in **Development Mode**, the [February 2026 Web API changes](https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide) require:

1. The app owner's Spotify account must have an **active Premium subscription**. Every account that will actually play music also needs Premium (Web Playback SDK requirement).
2. In your app's **User Management**, add every Spotify account that will log in (max 5 users).
3. Under **"Which API/SDKs are you planning to use?"**, select **Web API** and **Web Playback SDK**.
4. Register the **Redirect URIs** exactly (then **Save** — the form only persists once an API/SDK is selected):
   - `http://127.0.0.1:3000/api/auth/callback/spotify` (local — `http://localhost` is no longer accepted)
   - `https://<your-domain>/api/auth/callback/spotify` (production)

## Installation

Clone the repository and install dependencies with [pnpm](https://pnpm.io/):

```bash
git clone <repo-url>
cd nextify-project
pnpm install
```

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Then run the dev server:

```bash
pnpm dev
```

App runs at `http://127.0.0.1:3000`.

## Scripts

- `pnpm dev` — start the dev server
- `pnpm build` — production build
- `pnpm start` — run the production build
- `pnpm lint` — ESLint
- `pnpm test` — run the Vitest suite

## Known limitations (Spotify API changes)

Spotify restricted several Web API endpoints for development-mode apps in [Nov 2024](https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api) and [Feb 2026](https://developer.spotify.com/documentation/web-api/references/changes/february-2026). These features **cannot be restored in code** and were removed or replaced with live user data:

- **30-second preview player** — `preview_url` is no longer returned, so the old preview player was replaced with a real [Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk) player that streams **full tracks**. This requires the listener to have **Spotify Premium** and uses the `user-modify-playback-state` scope plus the `/me/player` endpoints. The player bar (play/pause/seek/volume) lives in `src/components/nowPlaying`, and tracks can be started from track rows and the track page.
- **Featured Playlists** — removed; the home and "Browse all" sections now use your own top tracks/artists, playlists and saved albums.
- **Browse Categories / Category playlists** — pages removed.
- **Related Artists** and **Artist Top Tracks** — sections removed from the artist page.
- **New Releases** — endpoint removed.
- **Search** — `limit` is capped at 10 (the new API maximum).
- **Library** — like/unlike now uses the consolidated `PUT/DELETE /me/library` endpoints.

If the app is later granted **Extended Quota Mode**, some of these features could be reintroduced.

Deploy link: [Nextify](https://nextify-project.vercel.app/)

### Created by: **_Alejandro Román_**
