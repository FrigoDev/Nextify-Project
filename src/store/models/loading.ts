import { createModel } from "@rematch/core";

import type { RootModel } from ".";

export const loading = createModel<RootModel>()({
  state: false,
  reducers: {
    setLoading: (state: boolean, payload: boolean) => {
      return payload;
    }
  }
});
