import { createModel } from "@rematch/core";

import spotifyApi from "@/lib/spotifyWebApi";

import type { RootModel } from ".";

export const likedAlbums = createModel<RootModel>()({
  state: [] as string[],
  reducers: {
    setLikedAlbums: (state, payload: string[]) => {
      return payload;
    },
    addLikedAlbum: (state, payload: string) => {
      return state.some((album) => album === payload)
        ? state
        : [...state, payload];
    },
    addSomeLikedAlbums: (state, payload: string[]) => {
      const albums = payload.filter(
        (album) => !state.some((likedAlbum) => likedAlbum === album)
      );
      return [...state, ...albums];
    },
    removeLikedAlbum: (state, payload: string) => {
      return state.filter((album) => album !== payload);
    },
  },
  effects: (dispatch) => ({
    async fetchLikedAlbums({
      access_token,
      offset,
    }: {
      access_token: string;
      offset?: number;
    }) {
      spotifyApi.setAccessToken(access_token);
      const { body } = await spotifyApi.getMySavedAlbums();
      const LikedAlbums = body.items.map((item) => item.album.id);
      if (offset === 0) {
        dispatch.likedAlbums.setLikedAlbums(LikedAlbums);
      } else {
        dispatch.likedAlbums.addSomeLikedAlbums(LikedAlbums);
      }
      if (body.next) {
        const next = body.next.split("offset=")[1];
        await dispatch.likedAlbums.fetchLikedAlbums({
          access_token,
          offset: parseInt(next),
        });
      }
    },
    async likeAlbum({
      access_token,
      albumId,
    }: {
      access_token: string;
      albumId: string;
    }) {
      spotifyApi.setAccessToken(access_token);
      await spotifyApi.addToMySavedAlbums([albumId]);
      dispatch.likedAlbums.addLikedAlbum(albumId);
    },
    async unlikeAlbum({
      access_token,
      albumId,
    }: {
      access_token: string;
      albumId: string;
    }) {
      spotifyApi.setAccessToken(access_token);
      await spotifyApi.removeFromMySavedAlbums([albumId]);
      dispatch.likedAlbums.removeLikedAlbum(albumId);
    },
  }),
});
