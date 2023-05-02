import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FaHome, FaSearch } from "react-icons/fa";
import { SiLibrariesdotio } from "react-icons/si";
import { useDispatch, useSelector } from "react-redux";
import useSWR from "swr";

import { Pages } from "@/constants/index";
import useMediaQuery from "@/hooks/useMediaQuery";
import { RootStates } from "@/store/models";
import { Dispatch } from "@/store/store";

const Sidebar = () => {
  const { data: session } = useSession();
  const dispatch: Dispatch = useDispatch();
  const fetcher = async (key: string) => {
    await dispatch.onlinePlayList.fetchPlaylists(key);
    await dispatch.likedAlbums.fetchLikedAlbums({
      access_token: key,
      offset: 0,
    });
    await dispatch.likedTracks.fetchLikedTracks({
      access_token: key,
      offset: 0,
    });
  };

  useSWR(session?.accessToken, fetcher);

  const playlist = useSelector((state: RootStates) => state.onlinePlayList);

  const isMobile = useMediaQuery("(max-width: 450px)");

  return (
    <>
      {isMobile ? (
        <nav className="fixed bottom-0 w-full bg-black bg-opacity-95 border-t border-gray-900 text-gray-500 pb-2 px-4 pt-4 z-10">
          <ul className="flex justify-around">
            <li>
              <Link className="flex-col hover:text-white" href={Pages.HOME}>
                <FaHome className="h-6 w-6 mx-auto" />
                <p className="text-xs text-center">Home</p>
              </Link>
            </li>
            <li>
              <Link className="flex-col hover:text-white" href={Pages.SEARCH}>
                <FaSearch className="h-6 w-6 mx-auto" />
                <p className="text-xs text-center">Search</p>
              </Link>
            </li>
            <li>
              <Link className="flex-col hover:text-white" href={Pages.LIBRARY}>
                <SiLibrariesdotio className="h-6 w-6 mx-auto" />
                <p className="text-xs text-center">Your Library</p>
              </Link>
            </li>
          </ul>
        </nav>
      ) : (
        <section className="flex-shrink-0 overflow-auto h-[100vh] scrollbar-hide text-gray-500 p-5 pb-24 text-sm bg-black border-r border-gray-900 max-[450px]:hidden">
          <div className="space-y-4">
            <Link
              className="flex items-center justify-center sm:justify-normal m-0 space-x-2 hover:text-white"
              href={Pages.HOME}
            >
              <FaHome className="sm:h-5 sm:w-5 h-6 w-6" />
              <p className="hidden sm:block">Home</p>
            </Link>
            <Link
              className="flex items-center justify-center sm:justify-normal m-0 space-x-2 hover:text-white"
              href={Pages.SEARCH}
            >
              <FaSearch className="sm:h-5 sm:w-5 h-6 w-6" />
              <p className="hidden sm:block">Search</p>
            </Link>
            <Link
              className="flex items-center justify-center sm:justify-normal m-0 space-x-2 hover:text-white"
              href={Pages.LIBRARY}
            >
              <SiLibrariesdotio className="sm:h-5 sm:w-5 h-6 w-6" />
              <p className="hidden sm:block">Your Library</p>
            </Link>
          </div>
          <div className="space-y-4">
            <hr className="border-t-[0.1]px border-gray-900 mt-4" />
            {playlist.map((item) => (
              <Link
                href={`/playlists/${item.id}`}
                key={item.id}
                className="flex items-center space-x-2 hover:text-white mb-2"
              >
                <Image
                  src={
                    item?.images[0]?.url ??
                    "/assets/images/SpotifyDefaultImage.jpg"
                  }
                  alt={item.name}
                  width={50}
                  height={50}
                  className="h-[50px] w-[50px] mx-auto object-cover rounded-sm"
                />
                <p className="text-sm truncate hidden w-24 sm:mx-0 sm:block md:w-36">
                  {item.name}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
};
export default Sidebar;
