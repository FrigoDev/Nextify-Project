import { useSession } from "next-auth/react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";

import { RootState } from "@/store/store";
import { Dispatch } from "@/store/store";

export default function LikedAlbums({
  albumId,
  callback,
}: {
  albumId: string;
  callback?: () => unknown;
}) {
  const dispatch = useDispatch<Dispatch>();
  const session = useSession();
  const likedAlbums = useSelector((state: RootState) =>
    state.likedAlbums.some((track) => track === albumId)
  );
  return likedAlbums ? (
    <FaHeart
      data-testid={"liked-albums"}
      onClick={() => {
        dispatch.likedAlbums.unlikeAlbum({
          access_token: session?.data?.accessToken as string,
          albumId,
        });
        callback && callback();
      }}
      className="mx-2 my-auto cursor-pointer min-w-[20px] min-h-[20px] hover:text-white hover:underline"
    />
  ) : (
    <FaRegHeart
      data-testid={"unliked-albums"}
      onClick={() => {
        dispatch.likedAlbums.likeAlbum({
          access_token: session?.data?.accessToken as string,
          albumId,
        });
        callback && callback();
      }}
      className="mx-2 my-auto cursor-pointer min-w-[20px] min-h-[20px] hover:text-white hover:underline"
    />
  );
}
