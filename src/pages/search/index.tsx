import { GetServerSideProps } from "next";
import Link from "next/link";
import { JWT, getToken } from "next-auth/jwt";

import Card from "@/components/Card";
import { Pages } from "@/constants";
import { getEmtpySearch, spotifySearch } from "@/utils/search";

const filters = [
  { label: "Songs", type: "track" },
  { label: "Albums", type: "album" },
  { label: "Artists", type: "artist" },
];

interface SearchProps {
  searchResult: SpotifyApi.SearchResponse;
  emtpySearch?: {
    id: string;
    name: string;
    images: string;
    owner: string | undefined;
    link: string;
  }[];
  ssrSearchParam: string;
}

export default function Search({
  emtpySearch,
  ssrSearchParam,
  searchResult,
}: SearchProps) {
  return (
    <div className="pb-24">
      <div className="flex flex-wrap items-center gap-2 px-6 py-4">
        <Link
          href={{
            pathname: Pages.SEARCH,
            ...(ssrSearchParam && { query: { search: ssrSearchParam } }),
          }}
        >
          <button className="rounded-full px-4 py-1.5 text-sm font-medium bg-white text-black">
            All
          </button>
        </Link>
        {filters.map((filter) => (
          <Link
            key={filter.type}
            href={{
              pathname: `${Pages.SEARCH}/${filter.type}`,
              query: {
                search: ssrSearchParam,
                page: 1,
              },
            }}
          >
            <button className="rounded-full px-4 py-1.5 text-sm font-medium bg-[#232323] text-white hover:bg-[#2a2a2a]">
              {filter.label}
            </button>
          </Link>
        ))}
      </div>
      <div>
        {emtpySearch && (
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-4xl text-white font-bold my-4">Browse all</h2>
            <div className="grid grid-cols-1 lg:grid-cols-4 min-[720px]:grid-cols-2 grid-flow-row md:gap-12 gap-4">
              {emtpySearch.map((item) => (
                <Card
                  key={item.id}
                  image={
                    item?.images ??
                    "https://upload.wikimedia.org/wikipedia/commons/c/cb/Square_gray.svg"
                  }
                  title={item.name}
                  description={item.owner ?? ""}
                  link={item.link}
                />
              ))}
            </div>
          </div>
        )}
        {searchResult?.artists && (
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-4xl text-white font-bold my-4">Artists</h2>
            <div className="grid grid-cols-1 lg:grid-cols-4 min-[720px]:grid-cols-2 grid-flow-row md:gap-12 gap-4">
              {searchResult.artists.items.map((item) => (
                <Card
                  key={item.id}
                  image={
                    item?.images[0]?.url ??
                    "https://upload.wikimedia.org/wikipedia/commons/c/cb/Square_gray.svg"
                  }
                  title={item.name}
                  description={item.genres?.slice(0, 3).join(", ") ?? ""}
                  link={`${Pages.ARTIST}/${item.id}`}
                />
              ))}
            </div>
          </div>
        )}
        {searchResult?.albums && (
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-4xl text-white font-bold my-4">Albums</h2>
            <div className="grid grid-cols-1 lg:grid-cols-4 min-[720px]:grid-cols-2 grid-flow-row md:gap-12 gap-4">
              {searchResult.albums.items.map((item) => (
                <Card
                  key={item.id}
                  image={
                    item?.images[0]?.url ??
                    "https://upload.wikimedia.org/wikipedia/commons/c/cb/Square_gray.svg"
                  }
                  title={item.name}
                  description={
                    item.artists
                      ?.slice(0, 3)
                      .map((artist) => artist.name)
                      .join(", ") ?? ""
                  }
                  link={`${Pages.ALBUM}/${item.id}`}
                />
              ))}
            </div>
          </div>
        )}
        {searchResult?.tracks && (
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-4xl text-white font-bold my-4">Songs</h2>
            <div className="grid grid-cols-1 lg:grid-cols-4 min-[720px]:grid-cols-2 grid-flow-row md:gap-12 gap-4">
              {searchResult.tracks.items.map((item) => (
                <Card
                  key={item.id}
                  image={
                    item?.album?.images[0]?.url ??
                    "https://upload.wikimedia.org/wikipedia/commons/c/cb/Square_gray.svg"
                  }
                  title={item.name}
                  description={
                    item.artists
                      ?.slice(0, 3)
                      .map((artist) => artist.name)
                      .join(", ") ?? ""
                  }
                  link={`${Pages.TRACKS}/${item.id}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { search } = context.query as { search?: string };

  if (search === "") {
    return {
      redirect: {
        destination: `/${Pages.SEARCH}`,
        permanent: true,
      },
    };
  }

  const token = await getToken({
    req: context.req,
    secret: process.env.SECRET,
  });

  if (!search) {
    return {
      props: {
        emtpySearch: await getEmtpySearch(token as JWT),
        ssrSearchParam: search ?? [],
      },
    };
  }

  if (search) {
    return {
      props: {
        searchResult: await spotifySearch(token as JWT, search, [
          "artist",
          "album",
          "track",
        ]),
        ssrSearchParam: search ?? "",
      },
    };
  }

  return {
    props: {
      ssrSearchParam: search ?? "",
    },
  };
};
