import { GetServerSideProps } from "next";
import Image from "next/image";
import { getToken } from "next-auth/jwt";
import { FaClock } from "react-icons/fa";

import Header from "@/components/Header";
import LikedAlbums from "@/components/likeButtons/likedAlbums";
import Song from "@/components/Song";
import { Pages } from "@/constants";
import useMediaQuery from "@/hooks/useMediaQuery";
import spotifyApi from "@/lib/spotifyWebApi";
import controlData from "@/utils/getData";

interface AlbumPageProps {
  album: SpotifyApi.AlbumObjectFull;
  data: SpotifyApi.TrackObjectFull[];
  page: number;
  id: string;
  totalPages: number;
}

export default function AlbumPage({ album, data: tracks }: AlbumPageProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="flex-grow h-screen overflow-y-scroll scrollbar-hide">
      <Header>
        <div className="flex flex-row">
          <Image
            src={album.images[0].url ?? "https://via.placeholder.com/300"}
            alt="Album Image Cover"
            width={200}
            height={200}
            className="rounded-lg mr-6 max-[400px]:w-24 max-[400px]:h-24 sm:w-[200px] sm:h-[200px] w-32 h-32"
          />
          <div className="flex flex-col justify-center mt-auto gap-1 sm:gap-4">
            <p className="text-sm hidden sm:block font-bold">Album</p>
            <h1 className="mt-auto text-2xl lg:text-4xl font-bold line-clamp-2">
              {album.name}
            </h1>
            <p className="text-sm hidden sm:block font-bold">{`Author: ${
              album.artists[0].name
            } - ${new Date(album.release_date).getFullYear()}`}</p>
          </div>
        </div>
      </Header>
      <div className="text-white max-[425px]:px-6 px-8 mb-4">
        <LikedAlbums albumId={album.id} />
      </div>
      {isMobile ? (
        <div className="px-8 flex flex-col space-y-1 pb-20 max-[450px]:pb-44 text-white">
          {tracks
            .filter((x) => x)
            .map((track) => (
              <Song
                key={track.id}
                track={
                  {
                    ...track,
                    album: {
                      images: album.images,
                    },
                  } as SpotifyApi.TrackObjectFull
                }
              />
            ))}
        </div>
      ) : (
        <div className="px-8 flex flex-col space-y-1 pb-24 text-white">
          <div className="album-grid my-4 border-b border-gray-400 text-gray-400">
            <p>#</p>
            <p>Title</p>
            <div></div>
            <FaClock />
          </div>
          {tracks
            .filter((x) => x)
            .map((track) => (
              <Song
                key={track.id}
                track={
                  {
                    ...track,
                    album: {
                      images: album.images,
                    },
                  } as SpotifyApi.TrackObjectFull
                }
              />
            ))}
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const albumId = context.query.id;
  const page = context.query.page;
  const LIMIT = 30;
  const token = await getToken({
    req: context.req,
    secret: process.env.SECRET,
  });
  spotifyApi.setAccessToken(token?.accessToken ?? "");
  try {
    const album = await spotifyApi.getAlbum(albumId as string);
    const getTracksAlbum = async (offset: number) => {
      if (album.body.total_tracks === album.body.tracks.items.length) {
        return {
          ...album.body.tracks,
          items: album.body.tracks.items.slice(offset, offset + LIMIT),
        } as SpotifyApi.PagingObject<SpotifyApi.TrackObjectFull>;
      }
      const tracks = await spotifyApi.getAlbumTracks(albumId as string, {
        offset,
        limit: LIMIT,
      });
      return tracks.body as SpotifyApi.PagingObject<SpotifyApi.TrackObjectFull>;
    };
    const result = await controlData<SpotifyApi.TrackObjectFull>(
      getTracksAlbum,
      Number(page),
      true,
      LIMIT,
      albumId as string,
      `${Pages.ALBUM}/${albumId as string}`
    );

    if ((result as { props: { [key: string]: unknown } }).props) {
      return {
        props: {
          ...(result as { props: { [key: string]: unknown } }).props,
          album: { ...album.body, tracks: null },
        },
      };
    }
    return result;
  } catch (error: unknown) {
    const errorMessage = (error as { body: { error: { message: string } } })
      ?.body?.error?.message;
    return {
      notFound: true,
    };
  }
};
