import { useSession } from "next-auth/react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";

import { RootState } from "@/store/store";
import { Dispatch } from "@/store/store";

export default function LikedTracks({
  trackId,
  callback,
}: {
  trackId: string;
  callback?: () => unknown;
}) {
  const dispatch = useDispatch<Dispatch>();
  const session = useSession();
  const likedTracks = useSelector((state: RootState) =>
    state.likedTracks.some((track) => track === trackId)
  );

  if (trackId === "") return null;

  return likedTracks ? (
    <FaHeart
      data-testid={"liked-tracks"}
      onClick={() => {
        dispatch.likedTracks.unlikeTrack({
          access_token: session?.data?.accessToken as string,
          trackId: trackId,
        });
        if (callback) callback();
      }}
      className="mx-2 my-auto cursor-pointer min-w-[20px] min-h-[20px] hover:text-white hover:underline"
    />
  ) : (
    <FaRegHeart
      data-testid={"unliked-tracks"}
      onClick={() => {
        dispatch.likedTracks.likeTrack({
          access_token: session?.data?.accessToken as string,
          trackId: trackId,
        });
        if (callback) callback();
      }}
      className="mx-2 my-auto cursor-pointer min-w-[20px] min-h-[20px] hover:text-white hover:underline"
    />
  );
}
