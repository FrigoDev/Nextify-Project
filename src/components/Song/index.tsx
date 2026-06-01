import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AiFillPlayCircle } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";

import { Pages } from "@/constants";
import useMediaQuery from "@/hooks/useMediaQuery";
import { Dispatch, RootState } from "@/store/store";

const Song = ({
  track,
  order,
}: {
  track: SpotifyApi.TrackObjectFull;
  order?: number;
}) => {
  const dispatch = useDispatch<Dispatch>();
  const { data: session } = useSession();
  const deviceId = useSelector((state: RootState) => state.playingSong.deviceId);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const playTrack = () => {
    if (!deviceId || !session?.accessToken) return;
    dispatch.playingSong.playTrack({
      access_token: session.accessToken,
      deviceId,
      track,
    });
  };

  const TrackInfo = () => (
    <div className="flex flex-row min-w-0">
      <Image
        className="mr-2"
        src={track.album.images[0].url}
        height={50}
        width={50}
        alt={track.album.name}
      />
      <div className="min-w-0">
        <Link
          className="hover:underline line-clamp-1"
          href={`${Pages.TRACKS}/${track.id}`}
        >
          <p>{track.name}</p>
        </Link>
        <p className="text-gray-400 text-sm line-clamp-1">
          {track.artists.map((artist) => (
            <Link
              className="hover:underline hover:text-white"
              href={`${Pages.ARTIST}/${artist.id}`}
              key={artist.id}
            >
              {`${artist.name} `}
            </Link>
          ))}
        </p>
      </div>
    </div>
  );

  const PlayButton = () => (
    <AiFillPlayCircle
      role="button"
      aria-label={`Play ${track.name}`}
      onClick={playTrack}
      className={`text-green-500 h-6 w-6 shrink-0 ${
        deviceId ? "cursor-pointer hover:scale-110" : "opacity-40"
      }`}
    />
  );

  return (
    <>
      {isMobile ? (
        <div className="grid grid-cols-[1fr_auto] items-center gap-2 opacity-75 hover:opacity-100">
          <TrackInfo />
          <PlayButton />
        </div>
      ) : (
        <div className="album-grid items-center opacity-75 hover:opacity-100">
          <p className="text-sm">{order ?? track.track_number}</p>
          <TrackInfo />
          <Link href={`/${Pages.ALBUM}/${track.album.id}?page=1`}>
            <p className="hidden text-sm md:inline hover:underline">
              {track.album.name}
            </p>
          </Link>
          <div className="flex flex-row items-center gap-2">
            <p className="text-sm">
              {new Date(track.duration_ms).toISOString().slice(14, 19)}
            </p>
            <PlayButton />
          </div>
        </div>
      )}
    </>
  );
};
export default Song;
