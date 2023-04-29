import { createModel } from "@rematch/core";

import type { RootModel } from ".";

export interface PlayList {
  id: string;
  name: string;
  description: string;
  coverImgUrl: string;
  trackCount: number;
  tracks: string[];
}

export const PlayListModel = createModel<RootModel>()({
  state: [] as PlayList[],
  reducers: {
    removePlayList: (state: PlayList[], payload: string) => {
      return state.filter((item) => item.id !== payload);
    },
    createPlayList: (state: PlayList[], payload: PlayList) => {
      return [...state, payload];
    },
    addTrackToPlayList: (
      state: PlayList[],
      payload: { id: string; trackId: string }
    ) => {
      return state.map((item) => {
        if (item.id === payload.id) {
          return {
            ...item,
            tracks: [...item.tracks, payload.trackId],
          };
        }
        return item;
      });
    },
    removeTrackFromPlayList: (
      state: PlayList[],
      payload: { id: string; trackId: string }
    ) => {
      return state.map((item) => {
        if (item.id === payload.id) {
          return {
            ...item,
            tracks: item.tracks.filter(
              (trackId) => trackId !== payload.trackId
            ),
          };
        }
        return item;
      });
    },
  },
});
