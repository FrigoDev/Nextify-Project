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
export const getEmtpySearch = async (token: JWT) => {
  spotifyApi.setAccessToken(token?.accessToken ?? "");
  return (
    await spotifyApi.getFeaturedPlaylists({ limit: 30, country: "CO" })
  ).body.playlists.items.map((playlist) => {
    return {
      id: playlist.id,
      name: playlist.name,
      images: playlist?.images[0]?.url,
      owner: playlist.owner.display_name,
      link: Pages.PLAYLIST + "/" + playlist.id,
    };
  });
};

export const spotifySearch = async (
  token: JWT,
  search: string,
  type: string[],
  offset = 0,
  limit = 12
) => {
  spotifyApi.setAccessToken(token?.accessToken ?? "");
  const result = (
    await spotifyApi.search(search, type as SearchType[], {
      limit,
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
