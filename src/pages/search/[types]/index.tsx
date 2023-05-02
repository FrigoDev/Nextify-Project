import { debounce } from "lodash";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { getToken } from "next-auth/jwt";
import { useCallback } from "react";

import Card from "@/components/Card";
import Pagination from "@/components/Pagination";
import { Pages } from "@/constants";
import {
  getEmtpySearch,
  isAlbums,
  isArtists,
  spotifySearch,
} from "@/utils/search";

const filters = ["album", "artist", "track"];

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
  page: number;
  total: number;
  limit: number;
}

export default function Search({
  ssrSearchParam,
  emtpySearch,
  searchResult,
  total,
  limit,
}: SearchProps) {
  const router = useRouter();
  const pluralType = ((router.query.types as string) + "s") as
    | "albums"
    | "artists"
    | "tracks";

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((newSearchParams: string) => {
      router.push(
        `${Pages.SEARCH}/${router.query.types}?search=${newSearchParams}&page=1`
      );
    }, 500),
    [router.query]
  );
  return (
    <div className="overflow-y-auto h-screen scrollbar-hide w-full pb-24">
      <div className="flex justify-center items-center h-20 bg-gradient-to-r from-green-400 to-green-700 text-white">
        <h1 className="text-lg lg:text-2xl font-bold text-white">Search</h1>
        <div className="flex justify-center">
          <input
            type="text"
            className=" bg-gray-800 text-white rounded-full px-1 py-1 ml-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            defaultValue={ssrSearchParam}
            onChange={(e) => {
              debouncedSearch(e.target.value.trim());
            }}
          />
        </div>
      </div>
      <div className="flex flex-row flex-wrap justify-center min-[300px]:justify-around items-center mt-2 my-4">
        <Link
          href={`${Pages.SEARCH}${
            ssrSearchParam ? `?search=${ssrSearchParam}` : ""
          }`}
        >
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full">
            All
          </button>
        </Link>
        {filters.map((filter) => (
          <Link
            key={filter}
            href={{
              pathname: `${Pages.SEARCH}/${filter}`,
              query: {
                search: ssrSearchParam,
                page: 1,
              },
            }}
          >
            <button
              className={`${
                router.query.types !== filter ? "bg-green-500" : "bg-green-700"
              } hover:bg-green-700 first-letter:uppercase text-white font-bold py-2 px-4 rounded-full`}
            >
              {filter}
            </button>
          </Link>
        ))}
      </div>
      <div>
        {emtpySearch && (
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl text-white font-bold my-4">Browse All</h1>
            <div className="grid grid-cols-1 lg:grid-cols-4 min-[720px]:grid-cols-2 grid-flow-row md:gap-12 gap-4">
              {emtpySearch.map((item) => (
                <Card
                  key={item.id}
                  image={item.images}
                  title={item.name}
                  description={item.owner ? item.owner : ""}
                  link={item.link}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-row flex-wrap justify-center items-center">
        <div className="grid grid-cols-1 lg:grid-cols-4 min-[720px]:grid-cols-2 grid-flow-row md:gap-12 gap-4">
          {searchResult &&
            searchResult[pluralType]?.items.map((item) => {
              if (isAlbums(item)) {
                return (
                  <Card
                    key={item.id}
                    image={item.images[0].url}
                    title={item.name}
                    description={item.artists[0].name}
                    link={`${Pages.ALBUM}/${item.id}`}
                  />
                );
              }
              if (isArtists(item)) {
                return (
                  <Card
                    key={item.id}
                    image={
                      item?.images[0]?.url ??
                      "https://upload.wikimedia.org/wikipedia/commons/c/cb/Square_gray.svg"
                    }
                    title={item.name}
                    description={item.genres[0]}
                    link={`${Pages.ARTIST}/${item.id}`}
                  />
                );
              }
              return (
                <Card
                  key={item.id}
                  image={
                    item?.album?.images[0]?.url ??
                    "https://upload.wikimedia.org/wikipedia/commons/c/cb/Square_gray.svg"
                  }
                  title={item.name}
                  description={item.artists[0].name}
                  link={`${Pages.TRACKS}/${item.id} `}
                />
              );
            })}
        </div>
      </div>
      {searchResult && (
        <Pagination
          page={parseInt(router.query.page as string)}
          limit={limit}
          total={total}
          url={`${Pages.SEARCH}/${router.query.types}`}
          queryParams={{
            search: ssrSearchParam,
          }}
        />
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { types, page, search } = context.query;
  const pluralType = ((types as string) + "s") as
    | "albums"
    | "artists"
    | "tracks";
  if (!search && page) {
    return {
      redirect: {
        destination: `/search/${types}`,
        permanent: false,
      },
    };
  }

  if (!filters.includes(types as string)) {
    return {
      redirect: {
        destination: "/search",
        permanent: false,
      },
    };
  }
  if (search && (Number(page) <= 0 || !Number(page) || Number(page) >= 100)) {
    return {
      redirect: {
        destination: `/search/${types}?search=${search as string}&page=1`,
        permanent: false,
      },
    };
  }

  const LIMIT = 10;

  const token = await getToken({
    req: context.req,
    secret: process.env.SECRET,
  });
  if (!token) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  if (!search) {
    return {
      props: {
        ssrSearchParam: "",
        emtpySearch: await getEmtpySearch(token),
      },
    };
  }
  const searchResult = await spotifySearch(
    token,
    search as string,
    [types as string],
    (Number(page) - 1) * LIMIT
  );
  if (
    (searchResult[pluralType] as SpotifyApi.PagingObject<unknown>).total <=
    (Number(page) - 1) * LIMIT
  ) {
    return {
      redirect: {
        destination: `/search/${types}?search=${search as string}&page=${
          Math.ceil((searchResult[pluralType]?.total as number) / LIMIT) - 1
        }`,
        permanent: false,
      },
    };
  }
  if (search) {
    return {
      props: {
        searchResult,
        page: Number(page),
        total: searchResult[pluralType]?.total as number,
        limit: LIMIT,
        ssrSearchParam: search || "",
      },
    };
  }

  return {
    props: {
      test: "test",
      ssrSearchParam: search || "",
    },
  };
};
