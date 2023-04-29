import { Models } from "@rematch/core";

import { loading } from "./loading";
import { onlinePlayList } from "./onlinePlaylist";
import { PlayListModel } from "./playlist";

export interface RootModel extends Models<RootModel> {
  playlist: typeof PlayListModel;
  loading: typeof loading;
  onlinePlayList: typeof onlinePlayList;
}

export const models: RootModel = {
  playlist: PlayListModel,
  loading,
  onlinePlayList,
};

export interface RootStates {
  playlist: typeof PlayListModel.state;
  loading: typeof loading.state;
  onlinePlayList: typeof onlinePlayList.state;
}
