import { debounce } from "lodash";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaChevronDown, FaHome, FaSearch } from "react-icons/fa";

import Dropdown from "@/components/Dropdown";
import { Pages } from "@/constants";
import spotifyApi from "@/lib/spotifyWebApi";

const SEARCH_TYPES = ["artist", "track", "album"] as const;

const userOptions = [
  { value: "profile", label: "Profile" },
  { value: "logout", label: "Log out" },
];

interface Suggestion {
  id: string;
  type: "artist" | "track" | "album";
  name: string;
  subtitle: string;
  image?: string;
  href: string;
}

const TopBar = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const tokenRef = useRef("");
  const latestQuery = useRef("");
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tokenRef.current = session?.accessToken ?? "";
  }, [session?.accessToken]);

  // Keep the field in sync when the search param changes elsewhere (back/forward).
  useEffect(() => {
    setQuery((router.query.search as string) ?? "");
  }, [router.query.search]);

  // Close the suggestions dropdown when clicking outside the search box.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchSuggestions = useCallback(
    debounce(async (value: string) => {
      if (!value || !tokenRef.current) return;
      try {
        spotifyApi.setAccessToken(tokenRef.current);
        const { body } = await spotifyApi.search(value, SEARCH_TYPES, {
          limit: 4,
          market: "CO",
        });
        if (latestQuery.current !== value) return; // stale response
        const artists: Suggestion[] = (body.artists?.items ?? []).map((a) => ({
          id: a.id,
          type: "artist",
          name: a.name,
          subtitle: "Artist",
          image: a.images?.[0]?.url,
          href: `${Pages.ARTIST}/${a.id}`,
        }));
        const tracks: Suggestion[] = (body.tracks?.items ?? []).map((t) => ({
          id: t.id,
          type: "track",
          name: t.name,
          subtitle: t.artists?.[0]?.name ?? "Song",
          image: t.album?.images?.[0]?.url,
          href: `${Pages.TRACKS}/${t.id}`,
        }));
        const albums: Suggestion[] = (body.albums?.items ?? []).map((al) => ({
          id: al.id,
          type: "album",
          name: al.name,
          subtitle: al.artists?.[0]?.name ?? "Album",
          image: al.images?.[0]?.url,
          href: `${Pages.ALBUM}/${al.id}`,
        }));
        setSuggestions([...artists, ...tracks, ...albums].slice(0, 8));
        setOpen(true);
      } catch {
        setSuggestions([]);
      }
    }, 350),
    []
  );

  const onChange = (value: string) => {
    setQuery(value);
    latestQuery.current = value.trim();
    if (value.trim()) {
      fetchSuggestions(value.trim());
    } else {
      setSuggestions([]);
      setOpen(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = query.trim();
    setOpen(false);
    router.push({
      pathname: Pages.SEARCH,
      ...(value && { query: { search: value } }),
    });
  };

  const isHome = router.pathname === Pages.HOME;

  return (
    <header className="relative z-40 flex h-16 flex-shrink-0 items-center bg-[#0a0a0a]/80 px-4 backdrop-blur">
      <div className="flex flex-1 items-center justify-center gap-3">
        <Link
          href={Pages.HOME}
          aria-label="Home"
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-black transition hover:scale-105 ${
            isHome ? "text-white" : "text-gray-300 hover:text-white"
          }`}
        >
          <FaHome className="h-5 w-5" />
        </Link>

        <div ref={searchRef} className="relative w-full max-w-[420px]">
          <form onSubmit={onSubmit}>
            <FaSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              aria-label="Search"
              placeholder="What do you want to play?"
              value={query}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setOpen(true)}
              className="w-full rounded-full border border-transparent bg-[#242424] py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-400 transition focus:border-white focus:outline-none hover:bg-[#2a2a2a]"
            />
          </form>

          {open && suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-30 mt-2 max-h-96 overflow-auto rounded-lg bg-[#282828] p-2 shadow-2xl">
              {suggestions.map((s) => (
                <li key={`${s.type}-${s.id}`}>
                  <Link
                    href={s.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-md p-2 hover:bg-white/10"
                  >
                    <Image
                      src={s.image ?? "/assets/images/SpotifyDefaultImage.jpg"}
                      alt={s.name}
                      width={40}
                      height={40}
                      className={`h-10 w-10 object-cover ${
                        s.type === "artist" ? "rounded-full" : "rounded"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm text-white">{s.name}</p>
                      <p className="truncate text-xs text-gray-400">
                        {s.subtitle}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="absolute right-4 max-[550px]:hidden">
        <Dropdown
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          options={userOptions}
          onSelect={(option) => {
            setMenuOpen(false);
            if (option.value === "profile") {
              router.push("/user");
            } else {
              signOut();
            }
          }}
        >
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center space-x-2 rounded-full bg-black p-1 pr-2 hover:opacity-90"
          >
            {session?.user?.image && (
              <Image
                width={30}
                height={30}
                className="rounded-full"
                src={session.user.image}
                alt="user profile image"
              />
            )}
            <span className="hidden text-sm font-bold text-white md:inline-flex">
              {session?.user?.name}
            </span>
            <FaChevronDown className="h-4 w-4 text-gray-300" />
          </button>
        </Dropdown>
      </div>
    </header>
  );
};

export default TopBar;
