import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaHome, FaSearch } from "react-icons/fa";
import { SiLibrariesdotio } from "react-icons/si";
import { useDispatch, useSelector } from "react-redux";
import useSWR from "swr";

import { Pages } from "@/constants/index";
import useMediaQuery from "@/hooks/useMediaQuery";
import { RootStates } from "@/store/models";
import { Dispatch } from "@/store/store";

const MIN_WIDTH = 180;
const MAX_WIDTH = 420;
const DEFAULT_WIDTH = 240;

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
  const contextUri = useSelector(
    (state: RootStates) => state.playingSong.contextUri
  );
  const router = useRouter();

  const isMobile = useMediaQuery("(max-width: 450px)");

  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const widthRef = useRef(DEFAULT_WIDTH);

  useEffect(() => {
    const saved = Number(localStorage.getItem("sidebarWidth"));
    if (saved >= MIN_WIDTH && saved <= MAX_WIDTH) {
      setWidth(saved);
      widthRef.current = saved;
    }
  }, []);

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    document.body.style.userSelect = "none";
    const onMove = (ev: MouseEvent) => {
      const w = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, ev.clientX));
      widthRef.current = w;
      setWidth(w);
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.userSelect = "";
      localStorage.setItem("sidebarWidth", String(widthRef.current));
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, []);

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
        <section
          style={{ width }}
          className="relative flex-shrink-0 h-[100vh] bg-black border-r border-gray-900 max-[450px]:hidden"
        >
          <div className="h-full overflow-auto scrollbar-hide text-gray-500 p-5 pb-24 text-sm">
            <div className="space-y-4">
              <Link
                className="flex items-center space-x-3 hover:text-white"
                href={Pages.HOME}
              >
                <FaHome className="h-6 w-6 shrink-0" />
                <p>Home</p>
              </Link>
              <Link
                className="flex items-center space-x-3 hover:text-white"
                href={Pages.SEARCH}
              >
                <FaSearch className="h-6 w-6 shrink-0" />
                <p>Search</p>
              </Link>
              <Link
                className="flex items-center space-x-3 hover:text-white"
                href={Pages.LIBRARY}
              >
                <SiLibrariesdotio className="h-6 w-6 shrink-0" />
                <p>Your Library</p>
              </Link>
            </div>
            <div className="space-y-2 mt-4">
              <hr className="border-t-[0.1]px border-gray-900" />
              {playlist.map((item) => {
                const isActive =
                  router.pathname === "/playlists/[id]" &&
                  router.query.id === item.id;
                const isPlaying =
                  contextUri === `spotify:playlist:${item.id}`;
                return (
                  <Link
                    href={`/playlists/${item.id}`}
                    key={item.id}
                    className={`flex items-center space-x-3 w-full rounded px-2 py-1 ${
                      isPlaying ? "text-green-500" : "hover:text-white"
                    } ${isActive ? "bg-white/10" : ""}`}
                  >
                    <Image
                      src={
                        item?.images[0]?.url ??
                        "/assets/images/SpotifyDefaultImage.jpg"
                      }
                      alt={item.name}
                      width={50}
                      height={50}
                      className="h-[50px] w-[50px] object-cover rounded-sm shrink-0"
                    />
                    <p className="text-sm truncate flex-1 min-w-0">
                      {item.name}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
          <div
            onMouseDown={startResize}
            role="separator"
            aria-orientation="vertical"
            className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize hover:bg-green-500/40 active:bg-green-500/60"
          />
        </section>
      )}
    </>
  );
};
export default Sidebar;
