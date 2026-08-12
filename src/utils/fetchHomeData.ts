import { unstable_cache } from "next/cache";
import { JWT } from "next-auth/jwt";

import spotifyApi from "@/lib/spotifyWebApi";

export interface HomeData {
  topTracks: SpotifyApi.PagingObject<SpotifyApi.TrackObjectFull>;
  topArtists: SpotifyApi.PagingObject<SpotifyApi.ArtistObjectFull>;
  playlists: SpotifyApi.PagingObject<SpotifyApi.PlaylistObjectSimplified>;
  savedAlbums: SpotifyApi.PagingObject<SpotifyApi.SavedAlbumObject>;
}

export const fetchHomeData = async (token: JWT): Promise<HomeData> => {
  spotifyApi.setAccessToken(token.accessToken ?? "");
  const [topTracks, topArtists, playlists, savedAlbums] = await Promise.all([
    spotifyApi.getMyTopTracks({ limit: 6, time_range: "short_term" }),
    spotifyApi.getMyTopArtists({ limit: 10 }),
    spotifyApi.getUserPlaylists({ limit: 10 }),
    spotifyApi.getMySavedAlbums({ limit: 10 }),
  ]);
  return {
    topTracks: topTracks.body,
    topArtists: topArtists.body,
    playlists: playlists.body,
    savedAlbums: savedAlbums.body,
  };
};

const cachedHomeData = (
  token: JWT
): Promise<HomeData> => {
  const userKey = token?.accessToken ? token.accessToken.slice(-8) : "anon";
  return unstable_cache(
    () => fetchHomeData(token),
    ["home-data", userKey],
    { revalidate: 300, tags: ["home"] }
  )();
};

export default cachedHomeData;
