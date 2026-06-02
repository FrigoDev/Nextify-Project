/**
 * Helpers for Spotify's consolidated library endpoints.
 *
 * Since the February 2026 Web API changes, the per-type save/remove/contains
 * endpoints (`PUT /me/tracks`, `PUT /me/albums`, `GET /me/tracks/contains`, ...)
 * were unified into `/me/library`, which `spotify-web-api-node` does not cover.
 * These helpers call them directly with the user's access token.
 *
 * - Save:   PUT    /me/library     { uris: ["spotify:track:..", "spotify:album:.."] }
 * - Remove: DELETE /me/library     { uris: [...] }
 * - Check:  GET    /me/library/contains?uris=spotify:track:..,spotify:album:..
 */

const API_BASE = "https://api.spotify.com/v1";

export type SpotifyEntity =
  | "track"
  | "album"
  | "episode"
  | "show"
  | "audiobook";

export const toUri = (type: SpotifyEntity, id: string): string =>
  `spotify:${type}:${id}`;

const libraryRequest = async (
  accessToken: string,
  method: "PUT" | "DELETE",
  uris: string[],
): Promise<void> => {
  if (uris.length === 0) return;
  const query = encodeURIComponent(uris.join(","));
  const res = await fetch(`${API_BASE}/me/library?uris=${query}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uris }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Spotify ${method} /me/library failed (${res.status}): ${detail}`,
    );
  }
};

export const saveToLibrary = (
  accessToken: string,
  uris: string[],
): Promise<void> => libraryRequest(accessToken, "PUT", uris);

export const removeFromLibrary = (
  accessToken: string,
  uris: string[],
): Promise<void> => libraryRequest(accessToken, "DELETE", uris);

export const libraryContains = async (
  accessToken: string,
  uris: string[],
): Promise<boolean[]> => {
  if (uris.length === 0) return [];
  const query = encodeURIComponent(uris.join(","));
  const res = await fetch(`${API_BASE}/me/library/contains?uris=${query}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Spotify GET /me/library/contains failed (${res.status}): ${detail}`,
    );
  }
  return (await res.json()) as boolean[];
};
