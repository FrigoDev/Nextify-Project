import { debounce } from "lodash";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { JWT, getToken } from "next-auth/jwt";
import { useCallback } from "react";

import Card from "@/components/Card";
import { Pages } from "@/constants";
import { getEmtpySearch, spotifySearch } from "@/utils/search";

const filters = ["Album", "Artist", "Track"];

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
  const router = useRouter();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((newSearchParams: string) => {
      router.push({
        pathname: router.pathname,
        query: {
          ...(newSearchParams && { search: newSearchParams }),
        },
      });
    }, 500),
    [router.query]
  );
  return (
    <div className="overflow-y-auto h-screen scrollbar-hide w-full pb-24">
      <div className="flex justify-center items-center p-4 bg-gradient-to-r from-green-400 to-green-700 text-white">
        <h1 className="text-lg lg:text-2xl font-bold text-white">Search</h1>
        <div className="flex justify-center">
          <input
            type="text"
            className="bg-gray-800 text-white rounded-full px-1 py-1 ml-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            defaultValue={ssrSearchParam}
            onChange={(e) => {
              debouncedSearch(e.target.value.trim());
            }}
          />
        </div>
      </div>
      <div className="flex flex-row flex-wrap justify-center min-[300px]:justify-around items-center mt-2 my-4">
        <Link
          className="mx-1"
          href={{
            pathname: router.pathname,
            query: {
              search: ssrSearchParam,
            },
          }}
        >
          <button className="bg-green-700 hover:bg-green-700 text-white font-bold my-1 py-2 px-4 rounded-full">
            All
          </button>
        </Link>
        {filters.map((filter) => (
          <Link
            className="mx-1"
            key={filter}
            href={{
              pathname: router.pathname + `/${filter.toLowerCase()}`,
              query: {
                search: ssrSearchParam,
                page: 1,
              },
            }}
          >
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold my-1 py-2 px-4 rounded-full">
              {filter}
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
                  link={item.external_urls.spotify}
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
            <h2 className="text-4xl text-white font-bold my-4">Tracks</h2>
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
                  link={item.external_urls.spotify}
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
