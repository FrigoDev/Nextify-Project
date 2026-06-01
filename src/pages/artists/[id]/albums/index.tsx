import { GetServerSideProps } from "next";
import Image from "next/image";
import { getToken } from "next-auth/jwt";

import Card from "@/components/Card";
import Header from "@/components/Header";
import Pagination from "@/components/Pagination";
import { Pages } from "@/constants";
import spotifyApi from "@/lib/spotifyWebApi";
import controlData from "@/utils/getData";

interface AlbumPageProps {
  artist: SpotifyApi.AlbumObjectFull;
  data: SpotifyApi.AlbumObjectSimplified[];
  page: number;
  id: string;
  totalPages: number;
}

export default function AlbumPage({
  artist,
  data: albums,
  id,
  page,
  totalPages,
}: AlbumPageProps) {
  return (
    <div className="flex-grow h-screen overflow-y-scroll scrollbar-hide pb-24">
      <Header>
        <div className="flex flex-row">
          <Image
            src={artist.images[0].url}
            alt="Playlist Image Cover"
            width={200}
            height={200}
            className="rounded-lg mr-6 max-[400px]:w-24 max-[400px]:h-24 sm:w-[200px] sm:h-[200px] w-32 h-32"
          />
          <div className="flex flex-col justify-center mt-auto gap-1 sm:gap-4">
            <p className="text-sm hidden sm:block font-bold">Artists albums</p>
            <h2 className="mt-auto text-2xl lg:text-4xl font-bold line-clamp-2">
              {artist.name}
            </h2>
          </div>
        </div>
      </Header>
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl text-white font-bold my-4">Albums</h1>
        <div className="grid grid-cols-1 lg:grid-cols-4 min-[720px]:grid-cols-2 grid-flow-row md:gap-12 gap-4">
          {albums
            .filter((x) => x)
            .map((album) => (
              <Card
                key={album.id}
                title={album.name}
                image={album.images[0].url}
                description=""
                link={`${Pages.ALBUM}/${album.id}`}
              />
            ))}
        </div>
      </div>
      <Pagination
        page={page}
        limit={12}
        total={totalPages}
        url={`${Pages.ARTIST}/${id}/albums`}
      />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const artistId = context.query.id;
  const page = context.query.page;
  const LIMIT = 12;
  const token = await getToken({
    req: context.req,
    secret: process.env.SECRET,
  });
  spotifyApi.setAccessToken(token?.accessToken ?? "");
  try {
    const artist = await spotifyApi.getArtist(artistId as string);
    const getAlbums = async (offset: number) => {
      const { body } = await spotifyApi.getArtistAlbums(artistId as string, {
        limit: LIMIT,
        offset,
      });
      return body as SpotifyApi.PagingObject<SpotifyApi.AlbumObjectSimplified>;
    };
    const result = await controlData(
      getAlbums,
      Number(page),
      true,
      LIMIT,
      artistId as string,
      `${Pages.ARTIST}/${artistId}/albums`
    );
    if ((result as { props: { [key: string]: unknown } }).props) {
      return {
        props: {
          ...(result as { props: { [key: string]: unknown } }).props,
          artist: { ...artist.body, tracks: null },
        },
      };
    }
    return result;
  } catch {
    return {
      notFound: true,
    };
  }
};
