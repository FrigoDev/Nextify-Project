import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef } from "react";
import { FaPause, FaPlay } from "react-icons/fa";
import { FiVolume2 } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";

import { Assets } from "@/constants";
import { Dispatch, RootState } from "@/store/store";

import LikedTracks from "../likeButtons/likedTracks";

const formatTime = (ms: number) =>
  new Date(Math.max(0, ms)).toISOString().slice(14, 19);

export default function NowPlaying() {
  const dispatch = useDispatch<Dispatch>();
  const { data: session } = useSession();
  const nowPlaying = useSelector((state: RootState) => state.playingSong);
  const { isPlaying, position, duration, volume } = nowPlaying;

  const playerRef = useRef<Spotify.Player | null>(null);
  const tokenRef = useRef<string>("");

  // Keep the latest access token available to the SDK's getOAuthToken callback.
  useEffect(() => {
    tokenRef.current = session?.accessToken ?? "";
  }, [session?.accessToken]);

  const initPlayer = useCallback(() => {
    if (playerRef.current || !window.Spotify) return;

    const player = new window.Spotify.Player({
      name: "Nextify Web Player",
      getOAuthToken: (cb) => cb(tokenRef.current),
      volume: 0.5,
    });
    playerRef.current = player;

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
    };
  }, []);

  // Poll playback position while a track is playing.
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(async () => {
      const state = await playerRef.current?.getCurrentState();
      if (state) dispatch.playingSong.setPosition(state.position);
    }, 1000);
    return () => clearInterval(id);
  }, [isPlaying, dispatch]);

  const togglePlay = () => {
    playerRef.current?.activateElement?.();
    playerRef.current?.togglePlay();
  };

  const onSeek = (ms: number) => {
    dispatch.playingSong.setPosition(ms);
    playerRef.current?.seek(ms);
  };

  const onChangeVolume = (value: number) => {
    dispatch.playingSong.setVolume(value);
    playerRef.current?.setVolume(value);
  };

  return (
    <>
      <Script
        src="https://sdk.scdn.co/spotify-player.js"
        strategy="afterInteractive"
      />
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex flex-row min-w-0">
          <Image
            className="cursor-pointer rounded-md"
            src={nowPlaying.image ? nowPlaying.image : Assets.DEFAULT_IMAGE}
            width={50}
            height={50}
            alt={nowPlaying.name}
          />
          <div className="flex flex-col mx-2 my-auto min-w-0">
            <Link href={`/tracks/${nowPlaying.id}`}>
              <p className="text-sm font-bold cursor-pointer hover:underline break-words line-clamp-2 max-[450px]:text-sx">
                {nowPlaying.name}
              </p>
            </Link>
            <Link href={`/artists/${nowPlaying.artistId}`}>
              <p className="text-xs text-gray-400 cursor-pointer hover:text-white hover:underline break-words line-clamp-1">
                {nowPlaying.artist}
              </p>
            </Link>
          </div>
          {nowPlaying.id && <LikedTracks trackId={nowPlaying.id} />}
        </div>
        <div className="flex flex-col justify-center w-1/3">
          <button
            className="bg-white hover:scale-105 text-black font-bold mx-auto py-3 px-3 rounded-full mb-2 disabled:opacity-40"
            onClick={togglePlay}
            disabled={!nowPlaying.isActive}
          >
            {isPlaying ? <FaPause /> : <FaPlay className="pl-1" />}
          </button>
          <div className="flex flex-row gap-2 justify-between max-[450px]:hidden">
            <p className="text-xs text-gray-400">{formatTime(position)}</p>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={1000}
              value={position}
              className="w-full h-1 m-auto"
              disabled={!nowPlaying.isActive}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
            />
            <p className="text-xs text-gray-400">{formatTime(duration)}</p>
          </div>
        </div>
        <div className="flex flex-row max-[450px]:hidden">
          <FiVolume2 />
          <input
            type="range"
            min={0}
            max={1}
            step="any"
            value={volume}
            onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
            className="w-16 h-1 m-auto"
          />
        </div>
      </div>
    </>
  );
}
