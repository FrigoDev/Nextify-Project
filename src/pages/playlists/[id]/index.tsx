import { GetServerSideProps } from "next";
import { getToken } from "next-auth/jwt";

import Hero from "@/components/Hero";
import PlayButton from "@/components/PlayButton";
import Songs from "@/components/Songs";
import spotifyApi from "@/lib/spotifyWebApi";
import { formatTotal } from "@/utils/duration";

export default function Playlist({
  playlist,
  error,
}: {
  playlist?: SpotifyApi.SinglePlaylistResponse;
  error?: string;
}) {
  if (!playlist || error) return <h1>{error}</h1>;

  const items = playlist.tracks.items;
  const allLoaded = playlist.tracks.total <= items.length;
  const totalMs = items.reduce(
    (sum, t) => sum + (t?.track?.duration_ms ?? 0),
    0
  );
  const followers = playlist.followers?.total ?? 0;

  return (
    <div className="flex-grow h-screen overflow-y-scroll scrollbar-hide">
      <Hero
        image={playlist.images[0]?.url}
        label="Playlist"
        title={playlist.name}
        description={playlist.description}
        meta={[
          <span key="owner" className="font-bold">
            {playlist.owner.display_name}
          </span>,
          followers > 0 ? `${followers.toLocaleString()} likes` : null,
          `${playlist.tracks.total} songs`,
          allLoaded && totalMs > 0 ? formatTotal(totalMs) : null,
        ]}
      />
      <div className="max-[425px]:px-6 px-8 my-5">
        <PlayButton contextUri={playlist.uri} />
      </div>
      <Songs tracks={items} contextUri={playlist.uri} />
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
  } catch {
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
