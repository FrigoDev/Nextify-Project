import Image from "next/image";
import Link from "next/link";
import { AiFillPlayCircle, AiFillPauseCircle } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";

import { Pages } from "@/constants";
import useMediaQuery from "@/hooks/useMediaQuery";
import { RootState, Dispatch } from "@/store/store";

const Song = ({
  track,
  order,
}: {
  track: SpotifyApi.TrackObjectFull;
  order?: number;
}) => {
  const dispatch = useDispatch<Dispatch>();
  const currentTrack = useSelector((state: RootState) => state.playingSong);

  const isMobile = useMediaQuery("(max-width: 768px)");

  if (currentTrack.id === track.id) {
    return (
      <>
        {isMobile ? (
          <div
            onClick={() => dispatch.playingSong.playTrack(track)}
            className="grid grid-cols-2 items-center cursor-pointer opacity-75 hover:opacity-100"
          >
            <div className="flex flex-row">
              <Image
                className="mr-2"
                src={track.album.images[0].url}
                height={50}
                width={50}
                alt={track.album.name}
              />
              <div>
                <Link
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="hover:underline line-clamp-1"
                  href={`${Pages.TRACKS}/${track.id}`}
                >
                  <p>{track.name}</p>
                </Link>
                <p className="text-gray-400 text-sm line-clamp-1">
                  {track.artists.map((artist) => (
                    <Link
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
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
            {currentTrack?.isPlaying ? (
              <div className="flex justify-end">
                <AiFillPauseCircle
                  className="text-green-500 cursor-pointer h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch.playingSong.pauseTrack();
                  }}
                />
              </div>
            ) : (
              <div className="flex justify-end">
                <AiFillPlayCircle
                  className="text-green-500 cursor-pointer h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch.playingSong.setIsPlaying(true);
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={() => dispatch.playingSong.playTrack(track)}
            className="album-grid items-center cursor-pointer opacity-75 hover:opacity-100"
          >
            <p className="text-sm">{order ?? track.track_number}</p>
            <div className="flex flex-row">
              <Image
                className="mr-2"
                src={track.album.images[0].url}
                height={50}
                width={50}
                alt={track.album.name}
              />
              <div>
                <Link
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="hover:underline line-clamp-1"
                  href={`${Pages.TRACKS}/${track.id}`}
                >
                  <p>{track.name}</p>
                </Link>
                <p className="text-gray-400 text-sm line-clamp-1">
                  {track.artists.map((artist) => (
                    <Link
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
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
            <Link
              onClick={(e) => {
                e.stopPropagation();
              }}
              href={`/${Pages.ALBUM}/${track.album.id}?page=1`}
            >
              <p className="hidden text-sm md:inline hover:underline">
                {track.album.name}
              </p>
            </Link>
            <div className="flex flex-row items-center gap-2">
              <p className="text-sm">
                {new Date(track.duration_ms).toISOString().slice(14, 19)}
              </p>
              {currentTrack?.isPlaying ? (
                <AiFillPauseCircle
                  className="text-green-500 cursor-pointer h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch.playingSong.pauseTrack();
                  }}
                />
              ) : (
                <AiFillPlayCircle
                  className="text-green-500 cursor-pointer h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch.playingSong.setIsPlaying(true);
                  }}
                />
              )}
            </div>
          </div>
        )}
      </>
    );
  }
  return (
    <>
      {isMobile ? (
        <div
          onClick={() => dispatch.playingSong.playTrack(track)}
          className="grid grid-cols-1 items-center opacity-75 hover:opacity-100"
        >
          <div className="flex flex-row">
            <Image
              className="mr-2"
              src={track.album.images[0].url}
              height={50}
              width={50}
              alt={track.album.name}
            />
            <div>
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
        </div>
      ) : (
        <div
          onClick={() => dispatch.playingSong.playTrack(track)}
          className="album-grid items-center opacity-75 hover:opacity-100"
        >
          <p className="text-sm">{order ?? track.track_number}</p>
          <div className="flex flex-row">
            <Image
              className="mr-2"
              src={track.album.images[0].url}
              height={50}
              width={50}
              alt={track.album.name}
            />
            <div>
              <Link
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="hover:underline line-clamp-1"
                href={`${Pages.TRACKS}/${track.id}`}
              >
                <p>{track.name}</p>
              </Link>
              <p className="text-gray-400 text-sm line-clamp-1">
                {track.artists.map((artist) => (
                  <Link
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
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
          <Link
            onClick={(e) => {
              e.stopPropagation();
            }}
            href={`/${Pages.ALBUM}/${track.album.id}?page=1`}
          >
            <p className="hidden text-sm md:inline hover:underline">
              {track.album.name}
            </p>
          </Link>
          <p className="text-sm">
            {new Date(track.duration_ms).toISOString().slice(14, 19)}
          </p>
        </div>
      )}
    </>
  );
};
export default Song;
