import { render, screen } from "@testing-library/react";
import { it } from "vitest";

import Footer from ".";
it("test_render_card_with_valid_props", () => {
  render(<Footer />);
  screen.getByText("Legal");
  screen.getByText("Privacy Center");
  screen.getByText("Privacy Policy");
  screen.getByText("Cookies");
  screen.getByText("About Ads");
  screen.getByText("© 2023 Spotify AB");
});
