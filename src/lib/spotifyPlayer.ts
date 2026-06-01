/**
 * Web API playback-control helpers used together with the Web Playback SDK.
 *
 * The SDK registers a browser "device"; to start a specific track on it we call
 * `PUT /me/player/play?device_id=...`. Pause/transfer use the matching endpoints.
 * These are current-user player endpoints (not the browse/batch endpoints removed
 * in February 2026), so they remain available to development-mode apps.
 */

const API_BASE = "https://api.spotify.com/v1";

const playerRequest = async (
  accessToken: string,
  path: string,
  body?: unknown
): Promise<void> => {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  // 204 No Content is the success case; 202 means the command was accepted.
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Spotify PUT ${path} failed (${res.status}): ${detail}`);
  }
};

export const startPlayback = (
  accessToken: string,
  deviceId: string,
  uris: string[]
): Promise<void> =>
  playerRequest(accessToken, `/me/player/play?device_id=${deviceId}`, { uris });

export const pausePlayback = (
  accessToken: string,
  deviceId: string
): Promise<void> =>
  playerRequest(accessToken, `/me/player/pause?device_id=${deviceId}`);

export const transferPlayback = (
  accessToken: string,
  deviceId: string,
  play = false
): Promise<void> =>
  playerRequest(accessToken, "/me/player", { device_ids: [deviceId], play });
