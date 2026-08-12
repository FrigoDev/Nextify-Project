import { beforeEach, describe, expect, it } from "vitest";

import { store } from "@/store/store";

describe("nowPlaying slice", () => {
  beforeEach(() => {
    store.dispatch({
      type: "playingSong/setTrack",
      payload: {
        id: "abc",
        name: "Song",
        artists: [{ id: "ar1", name: "Artist" }],
        album: { name: "Album", images: [{ url: "x" }] },
        duration_ms: 1000,
      },
    } as never);
  });

  it("setPosition updates only position, leaving other fields intact", () => {
    const before = store.getState().playingSong;
    store.dispatch({ type: "playingSong/setPosition", payload: 500 } as never);
    const after = store.getState().playingSong;
    expect(after.position).toBe(500);
    expect(after.id).toBe(before.id);
    expect(after.name).toBe(before.name);
    expect(after.deviceId).toBe(before.deviceId);
    expect(after.volume).toBe(before.volume);
    expect(after.isPlaying).toBe(before.isPlaying);
    expect(after.contextUri).toBe(before.contextUri);
  });

  it("setPosition does not change the deviceId used by Card/Song selectors", () => {
    store.dispatch({ type: "playingSong/setDeviceId", payload: "dev-1" } as never);
    store.dispatch({ type: "playingSong/setPosition", payload: 100 } as never);
    store.dispatch({ type: "playingSong/setPosition", payload: 200 } as never);
    store.dispatch({ type: "playingSong/setPosition", payload: 300 } as never);
    expect(store.getState().playingSong.deviceId).toBe("dev-1");
  });
});
