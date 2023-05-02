import { GetServerSideProps } from "next";
import Image from "next/image";
import { getToken } from "next-auth/jwt";

import Header from "@/components/Header";
import Songs from "@/components/Songs";
import spotifyApi from "@/lib/spotifyWebApi";

export default function Playlist({
  playlist,
  error,
}: {
  playlist?: SpotifyApi.SinglePlaylistResponse;
  error?: string;
}) {
  if (!playlist || error) return <h1>{error}</h1>;
  return (
    <div className="flex-grow h-screen overflow-y-scroll scrollbar-hide">
      <Header>
        <div className="flex flex-row">
          <Image
            src={playlist.images[0].url}
            alt="Playlist Image Cover"
            width={200}
            height={200}
            className="rounded-lg mr-6 max-[400px]:w-24 max-[400px]:h-24 sm:w-[200px] sm:h-[200px] w-32 h-32"
          />
          <div className="flex flex-col h-2/3 justify-center mt-auto gap-1 sm:gap-4">
            <p className="text-sm hidden sm:block font-bold">Playlist</p>
            <h1 className="mt-auto text-2xl lg:text-4xl font-bold line-clamp-2">
              {playlist.name}
            </h1>
            <p className="text-gray-300 text-sm line-clamp-2">
              {playlist.description}
            </p>
            <p className="text-sm hidden sm:block font-bold">{`Author: ${playlist.owner.display_name}`}</p>
          </div>
        </div>
      </Header>
      <Songs tracks={playlist.tracks.items} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const playListId = context.query.id;
  const page = context.query.page;
  const LIMIT = 30;

  if (!Number(page) || Number(page) < 1) {
    return {
      redirect: {
        destination: `/playlists/${playListId}?page=1`,
        permanent: false,
      },
    };
  }
  const pageNumer = Number(page);
  const offset = (pageNumer - 1) * LIMIT;
  const token = await getToken({
    req: context.req,
    secret: process.env.SECRET,
  });
  spotifyApi.setAccessToken(token?.accessToken ?? "");
  try {
    return await getPlaylistTracks(offset, LIMIT, playListId as string);
  } catch (error: unknown) {
    const errorMessage = (error as { body: { error: { message: string } } })
      ?.body?.error?.message;
    return {
      notFound: true,
    };
  }
};

async function getPlaylistTracks(
  offset: number,
  limit: number,
  playListId: string
) {
  const playlist = await spotifyApi.getPlaylist(playListId);
  let playlistTracks = playlist.body.tracks;
  const totalTracks = playlistTracks.total;

  if (offset > totalTracks) {
    return {
      redirect: {
        destination: `/playlists/${playListId}?page=${Math.ceil(
          totalTracks / limit
        )}`,
        permanent: false,
      },
    };
  } else if (totalTracks > 100 && offset > 100) {
    playlistTracks = (
      await spotifyApi.getPlaylistTracks(playListId, { offset, limit })
    ).body;
  } else if (offset < 100 && totalTracks > limit && totalTracks > 100) {
    const trackCut = playlistTracks.items.slice(offset, offset + limit);
    const trackAdd = (
      await spotifyApi.getPlaylistTracks(playListId, {
        offset: offset + trackCut.length,
        limit,
      })
    ).body;
    playlistTracks = {
      ...playlistTracks,
      items: [...trackCut, ...trackAdd.items].slice(0, limit),
    };
  } else if (offset < 100 && totalTracks < 100) {
    playlistTracks = {
      ...playlistTracks,
      items: playlistTracks.items.slice(offset, offset + limit),
    };
  }

  return {
    props: {
      playlist: {
        ...playlist.body,
        tracks: { ...playlistTracks, offset: offset },
      },
    },
  };
}
