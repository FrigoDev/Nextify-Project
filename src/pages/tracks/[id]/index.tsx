import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { getToken } from "next-auth/jwt";
import { useSession } from "next-auth/react";
import { Fragment } from "react";
import { FaPlay } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

import Hero from "@/components/Hero";
import LikedTracks from "@/components/likeButtons/likedTracks";
import { Assets, Pages } from "@/constants";
import { activatePlayer } from "@/lib/spotifyPlayerInstance";
import spotifyApi from "@/lib/spotifyWebApi";
import { Dispatch, RootState } from "@/store/store";

export default function TrackPage({
  track,
}: {
  track: SpotifyApi.SingleTrackResponse;
}) {
  const dispatch = useDispatch<Dispatch>();
  const { data: session } = useSession();
  const deviceId = useSelector((state: RootState) => state.playingSong.deviceId);

  const playTrack = () => {
    activatePlayer();
    if (!deviceId || !session?.accessToken) return;
    dispatch.playingSong.playTrack({
      access_token: session.accessToken,
      deviceId,
      track: track as SpotifyApi.TrackObjectFull,
    });
  };

  const year = track.album?.release_date
    ? new Date(track.album.release_date).getFullYear()
    : "";
  const duration = new Date(track.duration_ms).toISOString().slice(14, 19);

  return (
    <div className="pb-24">
      <Hero
        image={track?.album?.images[0]?.url}
        label="Song"
        title={track.name}
        meta={[
          <span key="artists" className="font-bold">
            {track.artists.map((artist, i) => (
              <Fragment key={artist.id}>
                <Link
                  href={`${Pages.ARTIST}/${artist.id}`}
                  className="hover:underline"
                >
                  {artist.name}
                </Link>
                {i < track.artists.length - 1 ? ", " : ""}
              </Fragment>
            ))}
          </span>,
          <Link
            key="album"
            href={`${Pages.ALBUM}/${track.album.id}?page=1`}
            className="hover:underline"
          >
            {track.album.name}
          </Link>,
          year || null,
          duration,
        ]}
      />

      <div className="flex flex-row items-center gap-5 text-white max-[425px]:px-6 px-8 my-5">
        <button
          aria-label="Play"
          onClick={playTrack}
          disabled={!deviceId}
          className="flex items-center justify-center h-14 w-14 rounded-full bg-green-500 text-black shadow-lg transition hover:scale-105 hover:bg-green-400 disabled:opacity-40 disabled:hover:scale-100"
        >
          <FaPlay className="h-5 w-5 pl-0.5" />
        </button>
        <LikedTracks trackId={track.id} />
      </div>

      <div className="max-[425px]:px-6 px-8">
        <Link
          href={`${Pages.ALBUM}/${track.album.id}?page=1`}
          className="inline-flex items-center gap-4 rounded-lg bg-white/5 p-4 transition hover:bg-white/10"
        >
          <Image
            src={track.album.images[0]?.url ?? Assets.DEFAULT_IMAGE}
            alt={track.album.name}
            width={80}
            height={80}
            sizes="80px"
            className="rounded"
          />
          <div>
            <p className="text-xs uppercase text-gray-400">From the album</p>
            <p className="font-bold text-white">{track.album.name}</p>
            {year && <p className="text-sm text-gray-400">{year}</p>}
          </div>
        </Link>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  const token = await getToken({
    req: context.req,
    secret: process.env.SECRET,
  });
  spotifyApi.setAccessToken(token?.accessToken ?? "");
  try {
    const track = await spotifyApi.getTrack(id as string);
    return {
      props: {
        track: track.body,
      },
    };
  } catch {
    return {
      notFound: true,
    };
  }
};
