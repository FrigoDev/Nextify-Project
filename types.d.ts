/// <reference types="next" />
/// <reference types="next/image-types/global" />
import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"];
    accessToken: string;
    refreshToken: string;
    username: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends Record<string, unknown>, DefaultJWT {
    accessToken?: string;
    refreshToken?: string;
    username?: string;
    accessTokenExpires?: number;
  }
}
