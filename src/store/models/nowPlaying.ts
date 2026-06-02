import { createModel } from "@rematch/core";

import { startContext, startPlayback } from "@/lib/spotifyPlayer";

import type { RootModel } from ".";

// Playback now uses the Spotify Web Playback SDK (full tracks, Premium only).
// This model holds only the serializable playback state; the Spotify.Player
// instance itself lives in the NowPlaying component (it is not serializable).
export interface NowPlayingState {
  deviceId: string;
  isActive: boolean;
  id: string;
  name: string;
  artist: string;
  artistId: string;
  album: string;
  image: string;
  duration: number;
  position: number;
  isPlaying: boolean;
  shuffle: boolean;
  volume: number;
  // URI of the playing context (e.g. "spotify:playlist:..."), "" for none.
  contextUri: string;
}

const initialState: NowPlayingState = {
  deviceId: "",
  isActive: false,
  id: "",
  name: "no track selected",
  artist: "",
  artistId: "",
  album: "",
  image: "",
  duration: 0,
  position: 0,
  isPlaying: false,
  shuffle: false,
  volume: 0.5,
  contextUri: "",
};

export interface PlaybackSnapshot {
  id: string;
  name: string;
  artist: string;
  artistId: string;
  album: string;
  image: string;
  duration: number;
  position: number;
  isPlaying: boolean;
  shuffle: boolean;
  contextUri: string;
}

export const playingSong = createModel<RootModel>()({
  state: initialState,
  reducers: {
    setDeviceId: (state, payload: string) => ({ ...state, deviceId: payload }),
    setActive: (state, payload: boolean) => ({ ...state, isActive: payload }),
    setIsPlaying: (state, payload: boolean) => ({
      ...state,
      isPlaying: payload,
    }),
    setPosition: (state, payload: number) => ({ ...state, position: payload }),
    setVolume: (state, payload: number) => ({ ...state, volume: payload }),
    setShuffle: (state, payload: boolean) => ({ ...state, shuffle: payload }),
    // Synced from the SDK's player_state_changed event.
    setPlaybackState: (state, payload: PlaybackSnapshot) => ({
      ...state,
      ...payload,
      isActive: true,
    }),
    // Optimistic update when the user starts a track from the UI.
    setTrack: (state, payload: SpotifyApi.TrackObjectFull) => ({
      ...state,
      id: payload.id,
      name: payload.name,
      artist: payload.artists[0]?.name ?? "",
      artistId: payload.artists[0]?.id ?? "",
      album: payload.album?.name ?? "",
      image: payload.album?.images[0]?.url ?? "",
      duration: payload.duration_ms,
      position: 0,
      isPlaying: true,
      contextUri: "",
    }),
  },
  effects: (dispatch) => ({
    async playTrack({
      access_token,
      deviceId,
      track,
    }: {
      access_token: string;
      deviceId: string;
      track: SpotifyApi.TrackObjectFull;
    }) {
      if (!deviceId) return;
      try {
        await startPlayback(access_token, deviceId, [
          `spotify:track:${track.id}`,
        ]);
        dispatch.playingSong.setTrack(track);
      } catch (err) {
        console.error("Failed to start playback:", err);
      }
    },
    async playContext({
      access_token,
      deviceId,
      contextUri,
      offsetUri,
    }: {
      access_token: string;
      deviceId: string;
      contextUri: string;
      offsetUri?: string;
    }) {
      if (!deviceId) return;
      try {
        await startContext(access_token, deviceId, contextUri, offsetUri);
      } catch (err) {
        console.error("Failed to start context playback:", err);
      }
    },
  }),
});
