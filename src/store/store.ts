import { init, RematchDispatch, RematchRootState } from "@rematch/core";
import persistPlugin from "@rematch/persist";
import { persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

import { models, RootModel } from "@/store/models";

export const store = init<RootModel>({
  models,
  plugins: [
    persistPlugin({
      key: "root",
      storage,
      whitelist: ["playlist"],
    }),
  ],
});

export type Store = typeof store;
export const persistor = persistStore(store);
export type Dispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel>;
