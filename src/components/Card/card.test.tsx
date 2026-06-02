import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { it, vi } from "vitest";

import { store } from "../../store/store";

import Card from ".";

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null }),
}));

it("test_render_card_with_valid_props", () => {
  render(
    <Provider store={store}>
      <Card
        image="https://via.placeholder.com/300"
        title="Test Title"
        description="Test Description"
        link="/test"
      />
    </Provider>
  );
  screen.getByText("Test Title");
  screen.getByText("Test Description");
  screen.getByAltText("Test Title");
});
