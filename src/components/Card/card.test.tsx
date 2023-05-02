import { render,screen} from "@testing-library/react";
import { it } from "vitest";

import Card from ".";
it("test_render_card_with_valid_props", () => {
  render(<Card image="https://via.placeholder.com/300" title="Test Title" description="Test Description" link="/test" />);
  screen.getByText("Test Title");
  screen.getByText("Test Description");
  screen.getByAltText("Test Title");
  
});