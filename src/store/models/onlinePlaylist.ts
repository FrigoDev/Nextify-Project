import { createModel } from "@rematch/core";

import spotifyApi from "@/lib/spotifyWebApi";

import type { RootModel } from ".";

export const onlinePlayList = createModel<RootModel>()({
  state: [] as Array<SpotifyApi.PlaylistObjectSimplified>,
  reducers: {
    setPlaylists: (
      state: Array<SpotifyApi.PlaylistObjectSimplified>,
      payload: Array<SpotifyApi.PlaylistObjectSimplified>
    ) => {
      if (!payload || JSON.stringify(payload) === JSON.stringify(state))
        return state;
      return payload;
    },
  },
  effects: (dispatch) => ({
    async fetchPlaylists(access_token: string) {
      spotifyApi.setAccessToken(access_token);

      const { body } = await spotifyApi.getUserPlaylists();
      dispatch.onlinePlayList.setPlaylists(body.items);
    },
  }),
});
