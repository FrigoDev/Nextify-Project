import { GetServerSideProps } from "next";
import Image from "next/image";
import { getToken } from "next-auth/jwt";
import { useSession } from "next-auth/react";
import useSWR, { SWRConfig } from "swr";

import Card from "@/components/Card";
import Header from "@/components/Header";
import { Assets, Pages } from "@/constants";
import spotifyApi from "@/lib/spotifyWebApi";
interface LibraryProps {
  likedTracks: SpotifyApi.UsersSavedTracksResponse;
  likedAlbums: SpotifyApi.UsersSavedAlbumsResponse;
}

const LibrarContent = () => {
  const { data: session } = useSession();

  const getData = async () => {
    if (session?.accessToken) {
      spotifyApi.setAccessToken(session?.accessToken);
      const [likedTracks, likedAlbums] = await Promise.all([
        spotifyApi.getMySavedTracks({ limit: 50 }),
        spotifyApi.getMySavedAlbums({ limit: 50 }),
      ]);
      return { likedTracks: likedTracks.body, likedAlbums: likedAlbums.body };
    }
  };

  const { data } = useSWR("likedThings", getData);

  return (
    <div className="pb-24">
      <Header>
        <div className="flex flex-row">
          <Image
            src={session?.user?.image ?? Assets.DEFAULT_IMAGE}
            alt="User Image"
            width={200}
            height={200}
            sizes="(max-width: 400px) 96px, (max-width: 640px) 128px, 200px"
            className="rounded-lg mr-6 max-[400px]:w-24 max-[400px]:h-24 sm:w-[200px] sm:h-[200px] w-32 h-32"
          />
          <div className="flex flex-col justify-center mt-auto gap-1 sm:gap-4">
            <p className="text-sm hidden sm:block font-bold">My library</p>
            <h1 className="mt-auto text-2xl lg:text-4xl font-bold line-clamp-2">
              {session?.user?.name}
            </h1>
            <p className="text-sm hidden sm:block font-bold">
              {data?.likedTracks.total} Tracks - {data?.likedAlbums.total}{" "}
              Albums
            </p>
          </div>
        </div>
      </Header>
      <div className="flex flex-col flex-wrap justify-center items-center mt-4">
        <h2 className="text-4xl text-white font-bold my-4">Liked tracks</h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 min-[720px]:grid-cols-2 grid-flow-row md:gap-12 gap-4">
          {data?.likedTracks &&
            data.likedTracks.items.map((track) => (
              <Card
                key={track.track.id}
                image={track.track.album.images[0].url}
                title={track.track.name}
                description={track.track.album.name}
                link={`${Pages.TRACKS}/${track.track.id}`}
              />
            ))}
        </div>
      </div>
      <div className="flex flex-col flex-wrap justify-center items-center mt-4">
        <h2 className="text-4xl text-white font-bold my-4">Liked albums</h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 min-[720px]:grid-cols-2 grid-flow-row md:gap-12 gap-4">
          {data?.likedAlbums &&
            data.likedAlbums.items.map((album) => (
              <Card
                key={album.album.id}
                image={album.album.images[0].url}
                title={album.album.name}
                description={album.album.artists[0].name}
                link={`${Pages.ALBUM}/${album.album.id}`}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default function Library({ likedTracks, likedAlbums }: LibraryProps) {
  return (
    <SWRConfig value={{ fallback: { likedTracks, likedAlbums } }}>
      <LibrarContent />
    </SWRConfig>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const LIMIT = 10;
  const token = await getToken({
    req: context.req,
    secret: process.env.SECRET,
  });
  spotifyApi.setAccessToken(token?.accessToken ?? "");
  try {
    const [likedTracks, likedAlbums] = await Promise.all([
      spotifyApi.getMySavedTracks({ limit: LIMIT }),
      spotifyApi.getMySavedAlbums({ limit: LIMIT }),
    ]);
    return {
      props: {
        likedTracks: likedTracks.body,
        likedAlbums: likedAlbums.body,
      },
    };
  } catch {
    return {
      notFound: true,
    };
  }
};
