import { useSession } from "next-auth/react";
import { FaPlay } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

import { activatePlayer } from "@/lib/spotifyPlayerInstance";
import { Dispatch, RootState } from "@/store/store";

// Large green play button that starts a whole album/playlist (a "context").
export default function PlayButton({ contextUri }: { contextUri: string }) {
  const dispatch = useDispatch<Dispatch>();
  const { data: session } = useSession();
  const deviceId = useSelector((state: RootState) => state.playingSong.deviceId);

  const play = () => {
    activatePlayer();
    if (!deviceId || !session?.accessToken) return;
    dispatch.playingSong.playContext({
      access_token: session.accessToken,
      deviceId,
      contextUri,
    });
  };

  return (
    <button
      aria-label="Play"
      onClick={play}
      disabled={!deviceId}
      className="flex items-center justify-center h-14 w-14 rounded-full bg-green-500 text-black shadow-lg transition hover:scale-105 hover:bg-green-400 disabled:opacity-40 disabled:hover:scale-100"
    >
      <FaPlay className="h-5 w-5 pl-0.5" />
    </button>
  );
}
