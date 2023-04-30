import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { BsSunFill } from "react-icons/bs";
import { FaHome, FaSearch, FaPlusCircle, FaHeart } from "react-icons/fa";
import { SiLibrariesdotio } from "react-icons/si";
import { useDispatch, useSelector } from "react-redux";
import useSWR from "swr";

import Modal from "@/components/Modal";
import { RootStates } from "@/store/models";
import { Dispatch } from "@/store/store";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const dispatch: Dispatch = useDispatch();
  const fetcher = async (key: string) => {
    await dispatch.onlinePlayList.fetchPlaylists(key);
  };
  const { error } = useSWR(session?.accessToken, fetcher);
  const playlist = useSelector((state: RootStates) => state.onlinePlayList);

  const handleOpenModal = () => {
    setIsOpen(true);
  };
  const handleCloseModal = () => {
    setIsOpen(false);
  };

  const handleRightClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    console.log("right click");
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleCloseModal}>
        <div className="flex flex-col items-center space-y-4">
          <h2 className="text-2xl font-bold">Create Playlist</h2>
          <div className="flex items-center space-x-2">
            <Image
              src={session?.user?.image ?? ""}
              width={50}
              height={50}
              className="rounded-full"
              alt="user profile image"
            />
            <p>{session?.user?.name}</p>
          </div>
        </div>
      </Modal>
      <section className="overflow-auto h-[100vh] scrollbar-hide text-gray-500 p-5 text-sm bg-black border-r border-gray-900 max-[400px]:hidden">
        <div className="space-y-4">
          <button className="flex items-center mx-auto md:m-0 space-x-2 hover:text-white">
            <FaHome className="h-5 w-5" />
            <p className="hidden md:inline-flex">Home</p>
          </button>
          <button className="flex items-center mx-auto md:m-0 space-x-2 hover:text-white">
            <FaSearch className="h-5 w-5" />
            <p className="hidden md:inline-flex">Search</p>
          </button>
          <button className="flex items-center mx-auto md:m-0 space-x-2 hover:text-white">
            <SiLibrariesdotio className="h-5 w-5" />
            <p className="hidden md:inline-flex">Your Library</p>
          </button>
          <hr className="border-t-[0.1]px border-gray-900" />
          <button
            onClick={handleOpenModal}
            className="flex items-center mx-auto md:m-0 space-x-2 hover:text-white"
          >
            <FaPlusCircle className="h-5 w-5" />
            <p className="hidden md:inline-flex">Create Playlist</p>
          </button>
          <button className="flex items-center mx-auto md:m-0 space-x-2 hover:text-white">
            <FaHeart className="h-5 w-5" />
            <p className="hidden md:inline-flex">Liked Songs</p>
          </button>
          <button className="flex items-center mx-auto md:m-0 space-x-2 hover:text-white">
            <BsSunFill className="h-5 w-5" />
            <p className="hidden md:inline-flex">Made For You</p>
          </button>
        </div>
        <div className="space-y-4">
          <hr className="border-t-[0.1]px border-gray-900 mt-4" />
          <div className="">
            {playlist.map((item) => (
              <Link
                href={`/playlists/${item.id}`}
                key={item.id}
                className="flex items-center space-x-2 hover:text-white mb-2"
                onContextMenu={handleRightClick}
              >
                <Image
                  src={
                    item?.images[0]?.url ??
                    "/assets/images/SpotifyDefaultImage.jpg"
                  }
                  alt={item.name}
                  width={50}
                  height={50}
                  className="h-[50px] object-cover rounded-sm"
                />

                <div
                  className={
                    "overflow-hidden whitespace-nowrap overflow-ellipsisw-[140px] hidden md:inline-flex md:w-[200px] lg:w-[250px]"
                  }
                >
                  <p className="text-sm">{item.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
export default Sidebar;
