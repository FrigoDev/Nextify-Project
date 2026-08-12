import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FaPause,
  FaPlay,
  FaRandom,
  FaStepBackward,
  FaStepForward,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

import { Assets } from "@/constants";
import { setShuffle as setShuffleApi } from "@/lib/spotifyPlayer";
import { setPlayerInstance } from "@/lib/spotifyPlayerInstance";
import { Dispatch, RootState } from "@/store/store";

import LikedTracks from "../likeButtons/likedTracks";

const formatTime = (ms: number) =>
  new Date(Math.max(0, ms)).toISOString().slice(14, 19);

export default function NowPlaying() {
  const dispatch = useDispatch<Dispatch>();
  const { data: session } = useSession();
  const deviceId = useSelector((state: RootState) => state.playingSong.deviceId);
  const shuffle = useSelector((state: RootState) => state.playingSong.shuffle);
  const isPlaying = useSelector((state: RootState) => state.playingSong.isPlaying);
  const duration = useSelector((state: RootState) => state.playingSong.duration);
  const volume = useSelector((state: RootState) => state.playingSong.volume);
  const nowPlaying = useSelector((state: RootState) => state.playingSong);

  const [localPosition, setLocalPosition] = useState(0);

  const playerRef = useRef<Spotify.Player | null>(null);
  const tokenRef = useRef<string>("");
  const lastVolume = useRef<number>(0.5);

  // Keep the latest access token available to the SDK's getOAuthToken callback.
  useEffect(() => {
    tokenRef.current = session?.accessToken ?? "";
  }, [session?.accessToken]);

  // Sync local progress when the Redux position changes (e.g. SDK events).
  useEffect(() => {
    setLocalPosition(nowPlaying.position);
  }, [nowPlaying.position]);

  const initPlayer = useCallback(() => {
    if (playerRef.current || !window.Spotify) return;

    const player = new window.Spotify.Player({
      name: "Nextify Web Player",
      getOAuthToken: (cb) => cb(tokenRef.current),
      volume: 0.5,
    });
    playerRef.current = player;
    setPlayerInstance(player);

    player.addListener("ready", ({ device_id }) => {
      dispatch.playingSong.setDeviceId(device_id);
    });
    player.addListener("not_ready", () => {
      dispatch.playingSong.setActive(false);
    });
    player.addListener("player_state_changed", (state) => {
      if (!state) {
        dispatch.playingSong.setActive(false);
        return;
      }
      const track = state.track_window.current_track;
      dispatch.playingSong.setPlaybackState({
        id: track.id ?? "",
        name: track.name,
        artist: track.artists[0]?.name ?? "",
        artistId: track.artists[0]?.uri?.split(":").pop() ?? "",
        album: track.album.name,
        image: track.album.images[0]?.url ?? "",
        duration: state.duration,
        position: state.position,
        isPlaying: !state.paused,
        shuffle: state.shuffle,
        contextUri: state.context?.uri ?? "",
      });
    });
    player.addListener("authentication_error", ({ message }) =>
      console.error("Spotify auth error:", message)
    );
    player.addListener("account_error", ({ message }) =>
      console.error("Spotify account error (Premium required):", message)
    );

    player.connect();
  }, [dispatch]);

  // Wire up the SDK as soon as it is available.
  useEffect(() => {
    if (!session?.accessToken) return;
    if (window.Spotify) {
      initPlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = initPlayer;
    }
  }, [session?.accessToken, initPlayer]);

  // Disconnect the player when the bar unmounts.
  useEffect(() => {
    return () => {
      playerRef.current?.disconnect();
      playerRef.current = null;
      setPlayerInstance(null);
    };
  }, []);

  // Drive the progress bar from a local interval + the last Redux position.
  // Polling `player.getCurrentState()` would cause a Redux dispatch every
  // second, which re-renders every component subscribed to `playingSong`.
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setLocalPosition((prev) => {
        const next = prev + 1000;
        return next >= duration ? duration : next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isPlaying, duration]);

  const togglePlay = () => {
    playerRef.current?.activateElement?.();
    playerRef.current?.togglePlay();
  };

  const onSeek = (ms: number) => {
    setLocalPosition(ms);
    playerRef.current?.seek(ms);
  };

  const onChangeVolume = (value: number) => {
    if (value > 0) lastVolume.current = value;
    dispatch.playingSong.setVolume(value);
    playerRef.current?.setVolume(value);
  };

  const toggleMute = () => {
    onChangeVolume(volume > 0 ? 0 : lastVolume.current || 0.5);
  };

  const fill = (pct: number) =>
    `linear-gradient(to right, #1db954 ${pct}%, #4d4d4d ${pct}%)`;
  const progressPct = duration ? (localPosition / duration) * 100 : 0;

  const toggleShuffle = async () => {
    if (!session?.accessToken || !deviceId) return;
    const next = !shuffle;
    dispatch.playingSong.setShuffle(next);
    try {
      await setShuffleApi(session.accessToken, deviceId, next);
    } catch (err) {
      console.error("Failed to toggle shuffle:", err);
    }
  };

  const hasTrack = Boolean(nowPlaying.id);

  return (
    <>
      <Script
        src="https://sdk.scdn.co/spotify-player.js"
        strategy="afterInteractive"
      />
      <div className="fixed bottom-0 max-[450px]:bottom-[65px] w-full bg-[#181818] border-t border-gray-800 text-white">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          {/* Track info (only once a track is loaded) */}
          <div className="flex flex-row items-center min-w-0 w-1/3">
            {hasTrack && (
              <>
                <Image
                  className="rounded-md"
                  src={
                    nowPlaying.image ? nowPlaying.image : Assets.DEFAULT_IMAGE
                  }
                  width={56}
                  height={56}
                  sizes="56px"
                  alt={nowPlaying.name}
                />
                <div className="flex flex-col mx-3 my-auto min-w-0">
                  <Link href={`/tracks/${nowPlaying.id}`}>
                    <p className="text-sm font-bold cursor-pointer hover:underline truncate">
                      {nowPlaying.name}
                    </p>
                  </Link>
                  <Link href={`/artists/${nowPlaying.artistId}`}>
                    <p className="text-xs text-gray-400 cursor-pointer hover:text-white hover:underline truncate">
                      {nowPlaying.artist}
                    </p>
                  </Link>
                </div>
                <LikedTracks trackId={nowPlaying.id} />
              </>
            )}
          </div>

          {/* Transport + progress */}
          <div className="flex flex-col items-center justify-center gap-1 w-1/3 max-w-[600px]">
            <div className="flex flex-row items-center gap-5">
              <button
                aria-label="Shuffle"
                onClick={toggleShuffle}
                className={`${
                  shuffle ? "text-green-500" : "text-gray-400"
                } hover:text-white`}
              >
                <FaRandom className="h-4 w-4" />
              </button>
              <button
                aria-label="Previous"
                onClick={() => playerRef.current?.previousTrack()}
                className="text-gray-300 hover:text-white"
              >
                <FaStepBackward className="h-4 w-4" />
              </button>
              <button
                aria-label={isPlaying ? "Pause" : "Play"}
                className="bg-white hover:scale-105 text-black rounded-full h-9 w-9 flex items-center justify-center"
                onClick={togglePlay}
              >
                {isPlaying ? <FaPause /> : <FaPlay className="pl-0.5" />}
              </button>
              <button
                aria-label="Next"
                onClick={() => playerRef.current?.nextTrack()}
                className="text-gray-300 hover:text-white"
              >
                <FaStepForward className="h-4 w-4" />
              </button>
              <div className="w-4" />
            </div>
            <div className="flex flex-row items-center gap-2 w-full max-[450px]:hidden">
              <span className="text-[11px] text-gray-400 tabular-nums">
                {formatTime(localPosition)}
              </span>
              <input
                type="range"
                aria-label="Seek"
                min={0}
                max={duration || 0}
                step={1000}
                value={localPosition}
                className="player-range flex-1"
                style={{ background: fill(progressPct) }}
                onChange={(e) => onSeek(parseFloat(e.target.value))}
              />
              <span className="text-[11px] text-gray-400 tabular-nums">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume */}
          <div className="flex flex-row items-center justify-end gap-2 w-1/3 max-[450px]:hidden">
            <button
              aria-label={volume > 0 ? "Mute" : "Unmute"}
              onClick={toggleMute}
              className="text-gray-300 hover:text-white"
            >
              {volume > 0 ? <FaVolumeUp /> : <FaVolumeMute />}
            </button>
            <input
              type="range"
              aria-label="Volume"
              min={0}
              max={1}
              step="any"
              value={volume}
              onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
              className="player-range w-28 lg:w-36"
              style={{ background: fill(volume * 100) }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
