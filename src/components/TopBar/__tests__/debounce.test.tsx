import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/router", () => ({
  useRouter: () => ({ pathname: "/", query: {}, push: vi.fn() }),
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { accessToken: "token", user: { name: "User", image: "" } },
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  signOut: vi.fn(),
}));

const fetcherSpy = vi.fn();
vi.mock("@/lib/spotifyWebApi", () => ({
  default: {
    setAccessToken: vi.fn(),
    search: (...args: unknown[]) => {
      fetcherSpy(...args);
      return Promise.resolve({
        body: {
          artists: { items: [] },
          tracks: { items: [] },
          albums: { items: [] },
        },
      });
    },
  },
}));

import TopBar from "..";

beforeEach(() => {
  fetcherSpy.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("TopBar search debounce", () => {
  it("does not call the API on every keystroke", async () => {
    vi.useFakeTimers();
    render(<TopBar />);

    const input = screen.getByLabelText("Search") as HTMLInputElement;
    fetcherSpy.mockClear();

    for (const ch of "abba") {
      fireEvent.change(input, { target: { value: input.value + ch } });
    }

    expect(fetcherSpy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(400);

    expect(fetcherSpy).toHaveBeenCalledTimes(1);
  });
});
