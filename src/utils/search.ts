import { JWT } from "next-auth/jwt";

import { Pages } from "@/constants";
import spotifyApi from "@/lib/spotifyWebApi";

export type SearchType =
  | "album"
  | "artist"
  | "playlist"
  | "track"
  | "show"
  | "episode";
// Spotify deprecated Featured Playlists (Nov 2024), so the default "Browse all"
// view is built from the user's own top artists instead.
export const getEmtpySearch = async (token: JWT) => {
  spotifyApi.setAccessToken(token?.accessToken ?? "");
  return (
    await spotifyApi.getMyTopArtists({ limit: 10 })
  ).body.items.map((artist) => {
    return {
      id: artist.id,
      name: artist.name,
      images: artist?.images[0]?.url,
      owner: artist.genres?.slice(0, 2).join(", "),
      link: Pages.ARTIST + "/" + artist.id,
    };
  });
};

// The search endpoint's max `limit` was reduced to 10 in February 2026.
export const SEARCH_LIMIT = 10;

export const spotifySearch = async (
  token: JWT,
  search: string,
  type: string[],
  offset = 0,
  limit = SEARCH_LIMIT
) => {
  spotifyApi.setAccessToken(token?.accessToken ?? "");
  const result = (
    await spotifyApi.search(search, type as SearchType[], {
      limit: Math.min(limit, SEARCH_LIMIT),
      offset,
      market: "CO",
    })
  ).body;
  return result;
};

export const isAlbums = (
  album:
    | SpotifyApi.TrackObjectFull
    | SpotifyApi.ArtistObjectFull
    | SpotifyApi.AlbumObjectSimplified
): album is SpotifyApi.AlbumObjectSimplified => {
  return (album as SpotifyApi.AlbumObjectSimplified).album_type !== undefined;
};
export const isArtists = (
  artist:
    | SpotifyApi.TrackObjectFull
    | SpotifyApi.ArtistObjectFull
    | SpotifyApi.AlbumObjectSimplified
): artist is SpotifyApi.ArtistObjectFull => {
  return (artist as SpotifyApi.ArtistObjectFull).followers !== undefined;
};
export const isTracks = (
  track:
    | SpotifyApi.TrackObjectFull
    | SpotifyApi.ArtistObjectFull
    | SpotifyApi.AlbumObjectSimplified
): track is SpotifyApi.TrackObjectFull => {
  return (track as SpotifyApi.TrackObjectFull)?.preview_url !== undefined;
};
