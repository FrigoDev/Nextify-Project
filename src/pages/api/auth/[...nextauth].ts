import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";
import SpotifyProvider from "next-auth/providers/spotify";

import spotifyApi, { LOGIN_URL } from "@/lib/spotifyWebApi";
async function refreshAccessToken(token: JWT) {
  try {
    spotifyApi.setAccessToken(token.accessToken ?? "");
    spotifyApi.setRefreshToken(token.refreshToken ?? "");
    const { body: refreshedToken } = await spotifyApi.refreshAccessToken();

    return {
      ...token,
      accessToken: refreshedToken.access_token,
      accessTokenExpires: Date.now() + refreshedToken.expires_in * 1000,
      refreshToken: refreshedToken.refresh_token ?? token.refreshToken,
    };
  } catch (err: unknown) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export default NextAuth({
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_PUBLIC_CLIENT_ID ?? "",
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? "",

      authorization: LOGIN_URL,
    }),
  ],
  secret: process.env.SECRET ?? "",
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account, user }) {
      {
        if (account && user) {
          return {
            ...token,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            username: account.providerAccountId,
            accessTokenExpires: account.expires_at
              ? account.expires_at * 1000
              : undefined,
          };
        }

        if (Date.now() < (token.accessTokenExpires as number)) {
          return token;
        }

        return await refreshAccessToken(token as JWT);
      }
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken ?? "";
      session.refreshToken = token.refreshToken ?? "";
      session.username = token.username ?? "";
      return session;
    },
  },
});
