import { fireEvent, render, screen } from "@testing-library/react";
import { BuiltInProviderType } from "next-auth/providers";
import { ClientSafeProvider, LiteralUnion, signIn } from "next-auth/react";
import { expect, it, vi, describe } from "vitest";

import Login from ".";

vi.mock("next-auth/react", () => {
  const signIn = vi.fn();
  return {
    signIn,
  };
});

describe("Login page", () => {
  it("test_renders_with_providers", () => {
    const providers = {
      spotify: {
        id: "spotify",
        name: "Spotify",
        type: "oauth",
        signinUrl: "http://localhost:3000/api/auth/signin/spotify",
        callbackUrl: "http://localhost:3000/api/auth/callback/spotify",
      },
    } as unknown as Record<
      LiteralUnion<BuiltInProviderType, string>,
      ClientSafeProvider
    >;
    render(<Login providers={providers} />);
    screen.getByText("Login with Spotify");
    const button = screen.getByText("Login with Spotify");
    fireEvent.click(button);
    expect(signIn).toBeCalled();
  });
});

export {};
