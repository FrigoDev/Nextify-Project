import { GetServerSideProps } from "next";
import { getToken } from "next-auth/jwt";

import Card from "@/components/Card";
import Pagination from "@/components/Pagination";
import { Pages } from "@/constants";
import spotifyApi from "@/lib/spotifyWebApi";

export default function FeaturedPlaylists({
  fPlaylist,
}: {
  fPlaylist: SpotifyApi.PagingObject<SpotifyApi.PlaylistObjectSimplified>;
}) {
  return (
    <div className="flex-grow h-screen overflow-y-scroll scrollbar-hide text-white pb-24">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl text-white font-bold my-4">
          Featured Playlist
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-4 min-[720px]:grid-cols-2 grid-flow-row md:gap-12 gap-4">
          {fPlaylist.items.map((playlist) => (
            <Card
              key={playlist.id}
              title={playlist.name}
              image={playlist.images[0].url}
              description={playlist?.description ?? ""}
              link={`${Pages.PLAYLIST}/${playlist.id}`}
            />
          ))}
        </div>
      </div>
      <Pagination
        total={fPlaylist.total}
        limit={12}
        url={Pages.RELEASES}
        page={Math.ceil(fPlaylist.offset / 12) + 1}
      />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { page } = context.query;
  if (!Number(page) || Number(page) < 1) {
    return {
      redirect: {
        destination: `${Pages.FEATURED_PLAYLIST}?page=1`,
        permanent: false,
      },
    };
  }
  const pageNumer = Number(page);
  const offset = (pageNumer - 1) * 10;
  const token = await getToken({
    req: context.req,
    secret: process.env.SECRET,
  });
  spotifyApi.setAccessToken(token?.accessToken ?? "");
  const fPlaylistData = await spotifyApi.getFeaturedPlaylists({
    limit: 12,
    offset,
  });
  if (fPlaylistData.body.playlists.total <= offset) {
    return {
      redirect: {
        destination: `${Pages.FEATURED_PLAYLIST}?page=${Math.ceil(
          fPlaylistData.body.playlists.total / 12
        )}`,
        permanent: false,
      },
    };
  }
  return {
    props: {
      fPlaylist: fPlaylistData.body.playlists,
    },
  };
};
