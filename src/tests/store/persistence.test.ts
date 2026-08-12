import { describe, expect, it } from "vitest";

import { store } from "@/store/store";

describe("store structure", () => {
  it("has the playlist slice (the only persisted one)", () => {
    expect(store.getState()).toHaveProperty("playlist");
  });

  it("has the slices required by the app", () => {
    const state = store.getState();
    expect(state).toHaveProperty("loading");
    expect(state).toHaveProperty("onlinePlayList");
    expect(state).toHaveProperty("playingSong");
    expect(state).toHaveProperty("likedAlbums");
    expect(state).toHaveProperty("likedTracks");
  });
});
