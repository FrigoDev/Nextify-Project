import { FaClock } from "react-icons/fa";

import useMediaQuery from "@/hooks/useMediaQuery";

import Song from "../Song";

const Songs = ({ tracks }: { tracks: SpotifyApi.PlaylistTrackObject[] }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <>
      {isMobile ? (
        <div className="px-8 flex flex-col space-y-1 pb-20 text-white">
          {tracks.map((track, i) =>
            track.track ? (
              <Song key={track?.track?.id} track={track?.track} order={i + 1} />
            ) : null
          )}
        </div>
      ) : (
        <div className="px-8 flex flex-col space-y-1 pb-24 max-[450px]:pb-72 text-white">
          <div className="album-grid my-4 border-b border-gray-400 text-gray-400">
            <p>#</p>
            <p>Title</p>
            <p>Album</p>
            <FaClock />
          </div>
          {tracks.map((track, i) =>
            track.track ? (
              <Song key={track?.track?.id} track={track?.track} order={i + 1} />
            ) : null
          )}
        </div>
      )}
    </>
  );
};
export default Songs;
