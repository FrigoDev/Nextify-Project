import { render, screen } from "@testing-library/react";
import { useRef } from "react";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import { store } from "@/store/store";

import Song from "..";

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null }),
}));

vi.mock("@/hooks/useMediaQuery", () => ({
  default: () => false,
}));

const track: SpotifyApi.TrackObjectFull = {
  id: "t1",
  name: "Sample Track",
  uri: "spotify:track:t1",
  duration_ms: 200000,
  track_number: 1,
  artists: [{ id: "a1", name: "Artist", type: "artist", uri: "spotify:artist:a1" }],
  album: {
    id: "al1",
    name: "Album",
    images: [{ url: "https://i.scdn.co/x" }],
    uri: "spotify:album:al1",
    album_type: "album",
    release_date: "2024-01-01",
    total_tracks: 10,
  },
  type: "track",
  is_local: false,
  explicit: false,
  popularity: 0,
  external_ids: {},
  external_urls: {},
  href: "",
  preview_url: null,
  available_markets: [],
} as unknown as SpotifyApi.TrackObjectFull;

const renderCount = { value: 0 };

const TrackedSong = ({ t }: { t: SpotifyApi.TrackObjectFull }) => {
  const ref = useRef(0);
  ref.current += 1;
  renderCount.value = ref.current;
  return (
    <ul>
      <Song track={t} order={1} />
    </ul>
  );
};

describe("Song memoization", () => {
  it("does not re-render when an unrelated slice field changes", () => {
    renderCount.value = 0;

    render(
      <Provider store={store}>
        <TrackedSong t={track} />
      </Provider>
    );

    const initial = renderCount.value;
    expect(initial).toBeGreaterThan(0);
    expect(screen.getByText("Sample Track")).toBeInTheDocument();

    // Trigger several Redux state changes that don't affect Song's props.
    store.dispatch({ type: "playingSong/setPosition", payload: 100 } as never);
    store.dispatch({ type: "playingSong/setPosition", payload: 200 } as never);
    store.dispatch({ type: "playingSong/setPosition", payload: 300 } as never);

    // The Song component should not have re-rendered because its props
    // (track, order, contextUri, addedAt) are unchanged.
    expect(renderCount.value).toBe(initial);
  });

  it("Song renders the track name and metadata", () => {
    render(
      <Provider store={store}>
        <ul>
          <Song track={track} order={1} />
        </ul>
      </Provider>
    );
    expect(screen.getByText("Sample Track")).toBeInTheDocument();
    expect(screen.getByText("Artist")).toBeInTheDocument();
  });
});
