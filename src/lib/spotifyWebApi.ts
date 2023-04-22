import SpotifyWebApi from "spotify-web-api-node";

const scopes = [
  "user-read-email",
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-read-email",
  "streaming",
  "user-read-private",
  "user-library-read",
  "user-top-read",
  "user-library-modify",
  "user-read-playback-state",
  "user-read-currently-playing",
  "user-read-recently-played",
  "user-follow-read",
  "user-follow-modify",
].join(",");

const params = {
  scope: scopes,
};

const queryParamsString = new URLSearchParams(params);

const LOGIN_URL = `https://accounts.spotify.com/authorize?${queryParamsString.toString()}`;

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_PUBLIC_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

export { LOGIN_URL };
export default spotifyApi;
