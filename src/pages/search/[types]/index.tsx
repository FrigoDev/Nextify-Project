import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { getToken } from "next-auth/jwt";

import Card from "@/components/Card";
import { Assets, Pages } from "@/constants";
import {
  getEmtpySearch,
  isAlbums,
  isArtists,
  spotifySearch,
} from "@/utils/search";

const Pagination = dynamic(() => import("@/components/Pagination"), {
  ssr: false,
});

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

  return (
    <div className="pb-24">
      <div className="flex flex-wrap items-center gap-2 px-6 py-4">
        <Link
          href={`${Pages.SEARCH}${
            ssrSearchParam ? `?search=${ssrSearchParam}` : ""
          }`}
        >
          <button className="rounded-full px-4 py-1.5 text-sm font-medium bg-[#232323] text-white hover:bg-[#2a2a2a]">
            All
          </button>
        </Link>
        {filters.map((filter) => {
          const active = router.query.types === filter.type;
          return (
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
              <button
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                  active
                    ? "bg-white text-black"
                    : "bg-[#232323] text-white hover:bg-[#2a2a2a]"
                }`}
              >
                {filter.label}
              </button>
            </Link>
          );
        })}
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
                      item?.images[0]?.url ?? Assets.DEFAULT_IMAGE
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
                    item?.album?.images[0]?.url ?? Assets.DEFAULT_IMAGE
                  }
                  title={item.name}
                  description={item.artists[0].name}
                  link={`${Pages.TRACKS}/${item.id}`}
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

  if (!filters.some((filter) => filter.type === types)) {
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
