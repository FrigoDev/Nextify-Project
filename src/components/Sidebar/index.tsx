import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaHome, FaSearch } from "react-icons/fa";
import { SiLibrariesdotio } from "react-icons/si";
import { useDispatch, useSelector } from "react-redux";
import useSWR from "swr";

import { Assets, Pages } from "@/constants/index";
import useMediaQuery from "@/hooks/useMediaQuery";
import spotifyApi from "@/lib/spotifyWebApi";
import { RootStates } from "@/store/models";
import { Dispatch } from "@/store/store";

const MIN_WIDTH = 180;
const MAX_WIDTH = 420;
const DEFAULT_WIDTH = 280;

type ChipType = "playlist" | "album" | "artist";

interface LibraryItem {
  id: string;
  type: ChipType;
  name: string;
  image?: string;
  subtitle: string;
  href: string;
  contextUri?: string;
}

const chips: { label: string; value: ChipType }[] = [
  { label: "Playlists", value: "playlist" },
  { label: "Albums", value: "album" },
  { label: "Artists", value: "artist" },
];

const Sidebar = () => {
  const { data: session } = useSession();
  const dispatch: Dispatch = useDispatch();

  const { data: library } = useSWR(
    session?.accessToken ?? null,
    async (token: string) => {
      await dispatch.onlinePlayList.fetchPlaylists(token);
      await dispatch.likedAlbums.fetchLikedAlbums({
        access_token: token,
        offset: 0,
      });
      await dispatch.likedTracks.fetchLikedTracks({
        access_token: token,
        offset: 0,
      });
      spotifyApi.setAccessToken(token);
      const [albumsRes, artistsRes] = await Promise.all([
        spotifyApi.getMySavedAlbums({ limit: 50 }),
        spotifyApi.getFollowedArtists({ limit: 50 }),
      ]);
      return {
        albums: albumsRes.body.items.map((item) => item.album),
        artists: artistsRes.body.artists.items,
      };
    }
  );

  const playlists = useSelector((state: RootStates) => state.onlinePlayList);
  const contextUri = useSelector(
    (state: RootStates) => state.playingSong.contextUri
  );
  const router = useRouter();

  const isMobile = useMediaQuery("(max-width: 450px)");

  const [activeChip, setActiveChip] = useState<ChipType | null>(null);
  const [alphabetical, setAlphabetical] = useState(false);

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

  const items = useMemo<LibraryItem[]>(() => {
    const playlistItems: LibraryItem[] = playlists.map((item) => ({
      id: item.id,
      type: "playlist",
      name: item.name,
      image: item.images?.[0]?.url,
      subtitle: `Playlist • ${item.owner?.display_name ?? ""}`,
      href: `${Pages.PLAYLIST}/${item.id}`,
      contextUri: `spotify:playlist:${item.id}`,
    }));
    const albumItems: LibraryItem[] = (library?.albums ?? []).map((album) => ({
      id: album.id,
      type: "album",
      name: album.name,
      image: album.images?.[0]?.url,
      subtitle: `Album • ${album.artists?.[0]?.name ?? ""}`,
      href: `${Pages.ALBUM}/${album.id}`,
      contextUri: `spotify:album:${album.id}`,
    }));
    const artistItems: LibraryItem[] = (library?.artists ?? []).map(
      (artist) => ({
        id: artist.id,
        type: "artist",
        name: artist.name,
        image: artist.images?.[0]?.url,
        subtitle: "Artist",
        href: `${Pages.ARTIST}/${artist.id}`,
      })
    );

    let result: LibraryItem[];
    if (activeChip === "playlist") result = playlistItems;
    else if (activeChip === "album") result = albumItems;
    else if (activeChip === "artist") result = artistItems;
    else result = [...playlistItems, ...albumItems, ...artistItems];

    if (alphabetical) {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [playlists, library, activeChip, alphabetical]);

  const routeByType: Record<ChipType, string> = {
    playlist: "/playlists/[id]",
    album: "/albums/[id]",
    artist: "/artists/[id]",
  };

  if (isMobile) {
    return (
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
    );
  }

  return (
    <section
      style={{ width }}
      className="relative flex flex-col flex-shrink-0 h-screen bg-black border-r border-gray-900"
    >
      <div className="px-4 pt-5 pb-2">
        <div className="flex items-center justify-between text-gray-300">
          <h2 className="font-title font-bold text-xs uppercase tracking-wide text-gray-400">
            Your Library
          </h2>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map((chip) => {
            const active = activeChip === chip.value;
            return (
              <button
                key={chip.value}
                onClick={() =>
                  setActiveChip(active ? null : chip.value)
                }
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  active
                    ? "bg-white text-black"
                    : "bg-[#232323] text-gray-200 hover:bg-[#2c2c2c]"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-end">
          <button
            onClick={() => setAlphabetical((prev) => !prev)}
            className="text-xs text-gray-400 hover:text-white"
          >
            {alphabetical ? "A–Z" : "Recents"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-hide px-2 pb-24">
        {items.map((item) => {
          const isActive =
            router.pathname === routeByType[item.type] &&
            router.query.id === item.id;
          const isPlaying =
            Boolean(item.contextUri) && contextUri === item.contextUri;
          return (
            <Link
              href={item.href}
              key={`${item.type}-${item.id}`}
              className={`flex items-center gap-3 w-full rounded-md px-2 py-2 ${
                isActive ? "bg-white/10" : "hover:bg-white/10"
              }`}
            >
              <Image
                src={item.image ?? Assets.DEFAULT_IMAGE}
                alt={item.name}
                width={48}
                height={48}
                sizes="48px"
                className={`h-12 w-12 object-cover shrink-0 ${
                  item.type === "artist" ? "rounded-full" : "rounded-sm"
                }`}
              />
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm ${
                    isPlaying ? "text-green-500" : "text-white"
                  }`}
                >
                  {item.name}
                </p>
                <p className="truncate text-xs text-gray-400">
                  {item.subtitle}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <div
        onMouseDown={startResize}
        role="separator"
        aria-orientation="vertical"
        className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize hover:bg-green-500/40 active:bg-green-500/60"
      />
    </section>
  );
};
export default Sidebar;
