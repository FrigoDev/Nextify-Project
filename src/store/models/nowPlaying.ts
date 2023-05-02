import { createModel } from "@rematch/core";

import type { RootModel } from ".";

export interface NowPlayingState {
  name: string;
  artist: string;
  album: string;
  image: string;
  duration: number;
  progress: number;
  isPlaying: boolean;
  volume: number;
  repeat: boolean;
  url: string;
  id: string;
  seek: number;
  artistId: string;
  updateProgress: boolean,
}

export const playingSong = createModel<RootModel>()({
  state: {
    name: "no track selected",
    artist: "",
    artistId: "",
    album: "",
    image: "",
    duration: 0,
    progress: 0,
    isPlaying: false,
    volume: 100,
    repeat: false,
    url: "",
    id: "",
    mute: false,
    seek: -1,
    updateProgress: true,
  } as NowPlayingState,

  reducers: {
    setTrack: (state: NowPlayingState, payload: SpotifyApi.TrackObjectFull) => {
      return {
        name: payload.name,
        artist: payload.artists[0].name,
        artistId: payload.artists[0].id,
        album: payload.album.name,
        image: payload.album.images[0].url,
        duration: payload.duration_ms,
        progress: 0,
        isPlaying: false,
        volume: 0.05,
        repeat: false,
        url: payload.preview_url,
        id: payload.id,
        seek: -1,
        updateProgress: true,
      } as NowPlayingState;
    },
    setProgress: (state: NowPlayingState, payload: number) => {
      return {
        ...state,
        progress: payload,
      };
    },
    setUpdateProgress: (state: NowPlayingState, payload: boolean) => {
      return {
        ...state,
        updateProgress: payload,
      };
    },

    setProgressControled: (state: NowPlayingState, payload: number) => {
      if (state.updateProgress) {
        return {
          ...state,
          progress: payload,
        };
      }

      return state;
    },

    setIsPlaying: (state: NowPlayingState, payload: boolean) => {
      return {
        ...state,
        isPlaying: payload,
      };
    },
    setVolume: (state: NowPlayingState, payload: number) => {
      return {
        ...state,
        volume: payload,
      };
    },
    setRepeat: (state: NowPlayingState, payload: boolean) => {
      return {
        ...state,
        repeat: payload,
      };
    },
    setMute: (state: NowPlayingState, payload: boolean) => {
      return {
        ...state,
        mute: payload,
      };
    },
    setSeek: (state: NowPlayingState, payload: number) => {
      return {
        ...state,
        seek: payload,
      };
    },
  },
  effects: (dispatch) => ({
    playTrack(payload: SpotifyApi.TrackObjectFull) {
      dispatch.playingSong.setTrack(payload);
      dispatch.playingSong.setIsPlaying(true);
    },
    pauseTrack() {
      dispatch.playingSong.setIsPlaying(false);
    }
  }),
});
