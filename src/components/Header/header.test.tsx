import { render, screen } from "@testing-library/react";
import { it, vi } from "vitest";

vi.mock("next/router", () => {
  const actual = vi.importActual("next/router");
  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn(),
      pathname: "/",
    }),
  };
});
vi.mock("next-auth/react", () => {
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
import Header from ".";

it("should render the header component", () => {
  const childern = (
    <div>
      <h1>hello</h1>
    </div>
  );
  render(<Header>{childern}</Header>);
  screen.getByText("hello");
});
