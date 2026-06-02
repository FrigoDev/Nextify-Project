import { GetServerSideProps } from "next";
import Link from "next/link";
import { getToken } from "next-auth/jwt";
import { FaClock } from "react-icons/fa";

import Hero from "@/components/Hero";
import LikedAlbums from "@/components/likeButtons/likedAlbums";
import PlayButton from "@/components/PlayButton";
import Song from "@/components/Song";
import { Pages } from "@/constants";
import useMediaQuery from "@/hooks/useMediaQuery";
import spotifyApi from "@/lib/spotifyWebApi";
import { formatTotal } from "@/utils/duration";
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
  const year = album.release_date
    ? new Date(album.release_date).getFullYear()
    : "";
  const allLoaded = album.total_tracks <= tracks.length;
  const totalMs = tracks.reduce((sum, t) => sum + (t?.duration_ms ?? 0), 0);

  return (
    <div className="flex-grow h-screen overflow-y-scroll scrollbar-hide">
      <Hero
        image={album.images[0]?.url}
        label="Album"
        title={album.name}
        meta={[
          <Link
            key="artist"
            href={`${Pages.ARTIST}/${album.artists[0].id}`}
            className="font-bold hover:underline"
          >
            {album.artists[0].name}
          </Link>,
          year || null,
          `${album.total_tracks} songs`,
          allLoaded ? formatTotal(totalMs) : null,
        ]}
      />
      <div className="flex flex-row items-center gap-5 text-white max-[425px]:px-6 px-8 my-5">
        <PlayButton contextUri={album.uri} />
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
                contextUri={album.uri}
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
                contextUri={album.uri}
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
  } catch {
    return {
      notFound: true,
    };
  }
};
