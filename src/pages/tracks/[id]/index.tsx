import { GetServerSideProps } from "next";
import Image from "next/image";
import { getToken } from "next-auth/jwt";
import { useSession } from "next-auth/react";
import { AiFillPlayCircle } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";

import Header from "@/components/Header";
import LikedTracks from "@/components/likeButtons/likedTracks";
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
    if (!deviceId || !session?.accessToken) return;
    dispatch.playingSong.playTrack({
      access_token: session.accessToken,
      deviceId,
      track: track as SpotifyApi.TrackObjectFull,
    });
  };

  return (
    <div className="flex-grow h-screen overflow-y-scroll scrollbar-hide pb-24">
      <Header>
        <div className="flex flex-row">
          <Image
            src={
              track?.album?.images[0]?.url ?? "https://via.placeholder.com/300"
            }
            alt={track?.album?.name}
            width={200}
            height={200}
            className="rounded-lg mr-6 max-[400px]:w-24 max-[400px]:h-24 sm:w-[200px] sm:h-[200px] w-32 h-32"
          />
          <div className="flex flex-col justify-center mt-auto gap-1 sm:gap-4">
            <p className="text-sm hidden sm:block font-bold">Song</p>
            <h1 className="mt-auto text-2xl lg:text-4xl font-bold line-clamp-2">
              {track.name}
            </h1>
            <p className="text-sm hidden sm:block font-bold">
              Artist {track.artists.map((artist) => artist.name).join(", ")}
            </p>
          </div>
        </div>
      </Header>
      <div className="flex flex-row items-center gap-2 text-white max-[425px]:px-6 px-8 mb-4">
        <LikedTracks trackId={track.id} />
        <AiFillPlayCircle
          role="button"
          aria-label={`Play ${track.name}`}
          onClick={playTrack}
          className={`text-green-500 h-8 w-8 ${
            deviceId ? "cursor-pointer hover:scale-110" : "opacity-40"
          }`}
        />
      </div>
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-2xl text-white font-bold my-4">Song Data Table</h2>
        <div className="grid grid-cols-2 border border-gray-300 w-3/4 md:w-1/2 lg:w-1/3 text-center text-white">
          <p className="text-lg font-bold border border-gray-300">Album</p>
          <p className="text-lg font-bold border border-gray-300">
            {track?.album?.name}
          </p>
          <p className="text-lg font-bold border border-gray-300">
            Release Date
          </p>
          <p className="text-lg font-bold border border-gray-300">
            {track?.album?.release_date}
          </p>
          <p className="text-lg font-bold border border-gray-300">Duration</p>
          <p className="text-lg font-bold border border-gray-300">
            {new Date(track.duration_ms).toISOString().slice(14, 19)}
          </p>
        </div>
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
