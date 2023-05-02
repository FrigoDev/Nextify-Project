import {fireEvent, render,screen } from "@testing-library/react";
import { Provider } from "react-redux";
import {expect, it, vi } from "vitest";

import {store} from "../../store/store";

import LikedAlbums from "./likedAlbums";

vi.mock("next-auth/react",() => {
  const actual = vi.importActual("next-auth/react");
  return {
    ...actual,
    useSession: () => ({
      data: {
        user: {
          image: "https://avatars.githubusercontent.com/u/59872806?v=4",
          name: "Rahul",
        },
      },
    }),
  };
});


it("test_liked_albums_renders_with_valid_props",async() => {
  const callback = vi.fn();
  render(
    <Provider  store={store}>
      <LikedAlbums albumId="test" callback={callback} />
    </Provider>
  );
  const button = await screen.getByTestId("unliked-albums");
  fireEvent.click(button);
  expect(callback).toHaveBeenCalled();
});