import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { getToken } from "next-auth/jwt";
import SpotifyWebApi from "spotify-web-api-node";

import Card from "@/components/Card";
import Header from "@/components/Header";
import { Pages } from "@/constants";

interface UserInfoProps {
  user: SpotifyApi.UserObjectPrivate;
  topArtists: SpotifyApi.ArtistObjectFull[];
  topTracks: SpotifyApi.TrackObjectFull[];
  followedArtists: SpotifyApi.ArtistObjectFull[];
}

export default function UserInfo({
  user,
  followedArtists,
  topArtists,
  topTracks,
}: UserInfoProps) {
  return (
    <div className="flex-grow h-screen overflow-y-scroll scrollbar-hide pb-24">
      <Header>
        <div className="flex flex-col items-center justify-center">
          <Image
            alt="user"
            src={user?.images?.at(0)?.url ?? "https://via.placeholder.com/300"}
            width={200}
            height={200}
            className="rounded-full"
          />
          <h3 className="text-2xl font-bold my-2 text-white">
            {user.display_name}
          </h3>
          {user.email && <p className="text-xl text-white">{user.email}</p>}
        </div>
      </Header>
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-2xl my-4 font-bold text-white">Top Artists</h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 min-[720px]:grid-cols-2 grid-flow-row md:gap-12 gap-4">
            {topArtists.map((artist) => (
              <Card
                image={
                  artist?.images?.at(0)?.url ??
                  "https://via.placeholder.com/300"
                }
                description=""
                link={`${Pages.ARTIST}/${artist.id}`}
                title={artist.name}
                key={artist.id}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-2xl my-4 font-bold text-white">Top Tracks</h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 min-[720px]:grid-cols-2 grid-flow-row md:gap-12 gap-4">
          {topTracks.map((track) => (
            <Card
              image={
                track?.album?.images?.at(0)?.url ??
                "https://via.placeholder.com/300"
              }
              description=""
              link={`${Pages.TRACKS}/${track.id}`}
              title={track.name}
              key={track.id}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center">
        <h2 className="text-2xl my-4 font-bold text-white mb-2">
          Followed Artists
        </h2>
        {followedArtists.length === 0 && (
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-2xl text-white">
              You don&apos;t follow any artist
            </h3>
            <Link href={Pages.SEARCH} className="text-xl text-white">
              Search for artists
            </Link>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-4 min-[720px]:grid-cols-2 grid-flow-row md:gap-12 gap-4">
          {followedArtists.map((artist) => (
            <Card
              image={
                artist?.images?.at(0)?.url ?? "https://via.placeholder.com/300"
              }
              description=""
              link={`${Pages.ARTIST}/${artist.id}`}
              title={artist.name}
              key={artist.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = await getToken({
    req: context.req,
    secret: process.env.SECRET,
  });
  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(token?.accessToken as string);
  try {
    const [user, topArtists, topTracks, followedArtists] = await Promise.all([
      spotifyApi.getMe(),
      spotifyApi.getMyTopArtists(),
      spotifyApi.getMyTopTracks(),
      spotifyApi.getFollowedArtists(),
    ]);
    return {
      props: {
        user: user.body,
        topArtists: topArtists.body.items,
        topTracks: topTracks.body.items,
        followedArtists: followedArtists.body.artists.items,
      },
    };
  } catch {
    return {
      notFound: true,
    };
  }
};
