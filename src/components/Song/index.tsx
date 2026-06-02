import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";

import { Pages } from "@/constants";
import useMediaQuery from "@/hooks/useMediaQuery";
import { activatePlayer } from "@/lib/spotifyPlayerInstance";
import { Dispatch, RootState } from "@/store/store";

const formatAdded = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const Song = ({
  track,
  order,
  contextUri,
  addedAt,
}: {
  track: SpotifyApi.TrackObjectFull;
  order?: number;
  // When provided, clicking the track plays it within the album/playlist
  // context (so prev/next work); otherwise it plays the single track.
  contextUri?: string;
  // ISO date the track was added to the playlist (shown as a column).
  addedAt?: string;
}) => {
  const dispatch = useDispatch<Dispatch>();
  const { data: session } = useSession();
  const deviceId = useSelector((state: RootState) => state.playingSong.deviceId);
  const currentId = useSelector((state: RootState) => state.playingSong.id);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const isCurrent = currentId !== "" && currentId === track.id;

  const playTrack = () => {
    activatePlayer();
    if (!deviceId || !session?.accessToken) return;
    if (contextUri) {
      dispatch.playingSong.playContext({
        access_token: session.accessToken,
        deviceId,
        contextUri,
        offsetUri: track.uri,
      });
    } else {
      dispatch.playingSong.playTrack({
        access_token: session.accessToken,
        deviceId,
        track,
      });
    }
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
          <p className={isCurrent ? "text-green-500" : ""}>{track.name}</p>
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

  return (
    <>
      {isMobile ? (
        <div
          onDoubleClick={playTrack}
          className="-mx-2 px-2 py-1 rounded-md cursor-pointer select-none transition-colors hover:bg-white/10"
        >
          <TrackInfo />
        </div>
      ) : (
        <div
          onDoubleClick={playTrack}
          className={`${
            addedAt ? "playlist-grid" : "album-grid"
          } items-center -mx-2 px-2 py-1 rounded-md cursor-pointer select-none transition-colors hover:bg-white/10`}
        >
          <p className={`text-sm ${isCurrent ? "text-green-500" : ""}`}>
            {order ?? track.track_number}
          </p>
          <TrackInfo />
          <Link href={`${Pages.ALBUM}/${track.album.id}?page=1`}>
            <p className="hidden text-sm md:inline hover:underline">
              {track.album.name}
            </p>
          </Link>
          {addedAt && (
            <p className="hidden md:block text-sm text-gray-400">
              {formatAdded(addedAt)}
            </p>
          )}
          <p className="text-sm">
            {new Date(track.duration_ms).toISOString().slice(14, 19)}
          </p>
        </div>
      )}
    </>
  );
};
export default Song;
