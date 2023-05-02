import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useEffect } from "react";
import { FaPause, FaPlay } from "react-icons/fa";
import { FiVolume2 } from "react-icons/fi";
import ReactPlayer from "react-player";
import { useDispatch, useSelector } from "react-redux";

import { Assets } from "@/constants";
import { RootState } from "@/store/store";
import { Dispatch } from "@/store/store";

import LikedTracks from "../likeButtons/likedTracks";

export default function NowPlaying() {
  const dispatch = useDispatch<Dispatch>();
  const nowPlaying = useSelector((state: RootState) => state.playingSong);
  const { url, isPlaying, repeat } = nowPlaying;
  const ref = useRef<ReactPlayer>(null);

  useEffect(() => {
    if (ref.current && nowPlaying.seek !== -1) {
      ref.current.seekTo(nowPlaying.seek);
      dispatch.playingSong.setSeek(-1);
    }
  }, [nowPlaying.seek, dispatch.playingSong]);

  const onChangeVolume = (volume: string) => {
    dispatch.playingSong.setVolume(parseFloat(volume));
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex flex-row">
          <Image
            className="cursor-pointer rounded-md"
            src={nowPlaying?.image ? nowPlaying.image : Assets.DEFAULT_IMAGE}
            width={50}
            height={50}
            alt={nowPlaying.name}
          />
          <div className="flex flex-col mx-2 my-auto">
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
          <LikedTracks trackId={nowPlaying.id} />
        </div>
        <div className="flex flex-col justify-center w-1/3">
          <button
            className="bg-white hover:scale-105 text-black font-bold mx-auto py-3 px-3 rounded-full mb-2"
            onClick={() => {
              dispatch.playingSong.setIsPlaying(!isPlaying);
            }}
          >
            {isPlaying ? <FaPause /> : <FaPlay className="pl-1" />}
          </button>
          <div className="flex flex-row gap-2 justify-between max-[450px]:hidden">
            <p className="text-xs text-gray-400">
              {new Date(nowPlaying.progress * 1000).toISOString().slice(14, 19)}
            </p>
            <input
              type="range"
              min={0}
              max={29.753469}
              step="any"
              value={nowPlaying.progress}
              className="w-full h-1 m-auto"
              onChange={(e) => {
                dispatch.playingSong.setProgress(parseFloat(e.target.value));
              }}
              onMouseUp={() => {
                dispatch.playingSong.setSeek(nowPlaying.progress);
                dispatch.playingSong.setUpdateProgress(true);
                dispatch.playingSong.setIsPlaying(true);
              }}
              onMouseDown={() => {
                dispatch.playingSong.setUpdateProgress(false);
                dispatch.playingSong.setIsPlaying(false);
              }}
            />
            <p className="text-xs text-gray-400">00:30</p>
          </div>
        </div>
        <div className="flex flex-row max-[450px]:hidden">
          <FiVolume2 />
          <input
            type="range"
            min={0}
            max={1}
            step="any"
            value={nowPlaying.volume}
            onChange={(e) => onChangeVolume(e.target.value)}
            className="w-16 h-1 m-auto"
          />
        </div>
        <div className="hidden">
          <ReactPlayer
            ref={ref}
            url={url}
            volume={nowPlaying.volume}
            playing={isPlaying}
            controls={false}
            onProgress={(progress) => {
              dispatch.playingSong.setProgress(progress.playedSeconds);
            }}
            loop={repeat}
            onEnded={() => {
              dispatch.playingSong.setIsPlaying(false);
            }}
          />
        </div>
      </div>
    </>
  );
}
