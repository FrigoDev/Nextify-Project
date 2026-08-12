import { createModel } from "@rematch/core";

import {
  removeFromLibrary,
  saveToLibrary,
  toUri,
} from "@/lib/spotifyLibrary";
import spotifyApi from "@/lib/spotifyWebApi";

import type { RootModel } from ".";

export const likedTracks = createModel<RootModel>()({
  state: [] as string[],
  reducers: {
    setLikedTracks: (state, payload: string[]) => {
      return payload;
    },
    addLikedTrack: (state, payload: string) => {
      return state.some((track) => track === payload)
        ? state
        : [...state, payload];
    },
    addSomeLikedTracks: (state, payload: string[]) => {
      const tracks = payload.filter(
        (track) => !state.some((likedTrack) => likedTrack === track)
      );
      return [...state, ...tracks];
    },
    removeLikedTrack: (state, payload: string) => {
      return state.filter((track) => track !== payload);
    },
  },
  effects: (dispatch) => ({
    async fetchLikedTracks({
      access_token,
      offset,
    }: {
      access_token: string;
      offset?: number;
    }) {
      spotifyApi.setAccessToken(access_token);
      const { body } = await spotifyApi.getMySavedTracks({
        limit: 50,
        offset: offset,
      });
      const LikedTracks = body.items.map((item) => item.track.id);
      if (offset === 0) {
        dispatch.likedTracks.setLikedTracks(LikedTracks);
      } else {
        dispatch.likedTracks.addSomeLikedTracks(LikedTracks);
      }
      // Cap the recursive fetch: the heart icon only needs to know whether a
      // small set of IDs is liked, so loading thousands of saved tracks on
      // every page load wastes bandwidth and slows the sidebar.
      const MAX_OFFSET = 200;
      if (body.next && (offset ?? 0) < MAX_OFFSET) {
        const next = body.next.split("offset=")[1];
        await dispatch.likedTracks.fetchLikedTracks({
          access_token,
          offset: parseInt(next),
        });
      }
    },
    async likeTrack({
      access_token,
      trackId,
    }: {
      access_token: string;
      trackId: string;
    }) {
      await saveToLibrary(access_token, [toUri("track", trackId)]);
      dispatch.likedTracks.addLikedTrack(trackId);
    },
    async unlikeTrack({
      access_token,
      trackId,
    }: {
      access_token: string;
      trackId: string;
    }) {
      await removeFromLibrary(access_token, [toUri("track", trackId)]);
      dispatch.likedTracks.removeLikedTrack(trackId);
    },
  }),
});
