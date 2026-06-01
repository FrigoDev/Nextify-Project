import { createModel } from "@rematch/core";

import { startPlayback } from "@/lib/spotifyPlayer";

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
  volume: number;
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
  volume: 0.5,
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
      await startPlayback(access_token, deviceId, [`spotify:track:${track.id}`]);
      dispatch.playingSong.setTrack(track);
    },
  }),
});
