import { Models } from "@rematch/core";

import { likedAlbums } from "./likedAlbums";
import { likedTracks } from "./likedTracks";
import { loading } from "./loading";
import { playingSong } from "./nowPlaying";
import { onlinePlayList } from "./onlinePlaylist";
import { PlayListModel } from "./playlist";
export interface RootModel extends Models<RootModel> {
  playlist: typeof PlayListModel;
  loading: typeof loading;
  onlinePlayList: typeof onlinePlayList;
  playingSong: typeof playingSong;
  likedAlbums: typeof likedAlbums;
  likedTracks: typeof likedTracks;
}

export const models: RootModel = {
  playlist: PlayListModel,
  loading,
  onlinePlayList,
  playingSong,
  likedAlbums,
  likedTracks
};

export interface RootStates {
  playlist: typeof PlayListModel.state;
  loading: typeof loading.state;
  onlinePlayList: typeof onlinePlayList.state;
  playingSong: typeof playingSong.state;
  likedAlbums: typeof likedAlbums.state;
  likedTracks: typeof likedTracks.state;
}
