import {BsSunFill} from "react-icons/bs";
import {FaHome, FaSearch, FaPlusCircle, FaRegHeart} from "react-icons/fa";
import {SiLibrariesdotio} from "react-icons/si";

const Sidebar = () => {
  return (
    <div className="text-gray-500 p-5 text-sm border-r border-gray-900 overflow-y-scroll scrollbar-hide h-screen">
      <div className="space-y-4">
        <button className="flex items-center space-x-2 hover:text-white">
          <FaHome className="h-5 w-5"/>
          <p>Home</p>
        </button>
        <button className="flex items-center space-x-2 hover:text-white">
          <FaSearch className="h-5 w-5"/>
          <p>Search</p>
        </button>
        <button className="flex items-center space-x-2 hover:text-white">
          <SiLibrariesdotio className="h-5 w-5"/>
          <p>Your Library</p>
        </button>
        <hr className="border-t-[0.1]px border-gray-900"/>
        <button className="flex items-center space-x-2 hover:text-white">
          <FaPlusCircle className="h-5 w-5"/>
          <p>Create Playlist</p>
        </button>
        <button className="flex items-center space-x-2 hover:text-white">
          <FaRegHeart className="h-5 w-5"/>
          <p>Liked Songs</p>
        </button>
        <button className="flex items-center space-x-2 hover:text-white">
          <BsSunFill className="h-5 w-5"/>
          <p>Made For You</p>
        </button>
        <hr className="border-t-[0.1]px border-gray-900"/>
        <p className="cursor-pointer hover:text-white">Playlist Name...</p>
        <p className="cursor-pointer hover:text-white">Playlist Name...</p>
        <p className="cursor-pointer hover:text-white">Playlist Name...</p>
        <p className="cursor-pointer hover:text-white">Playlist Name...</p>
        <p className="cursor-pointer hover:text-white">Playlist Name...</p>
        <p className="cursor-pointer hover:text-white">Playlist Name...</p>
      </div>
    </div>
  );
};
export default Sidebar;