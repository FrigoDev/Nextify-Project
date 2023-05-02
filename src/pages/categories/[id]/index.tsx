import { GetServerSideProps } from "next";
import Image from "next/image";
import { getToken } from "next-auth/jwt";

import Card from "@/components/Card";
import Header from "@/components/Header";
import { Pages } from "@/constants";
import spotifyApi from "@/lib/spotifyWebApi";
import controlData from "@/utils/getData";

interface categoryPageProps {
  category: SpotifyApi.CategoryObject;
  data: SpotifyApi.PlaylistObjectSimplified[];
  page: number;
  id: string;
}

export default function CategoryPage({ data, category }: categoryPageProps) {
  return (
    <div className="flex-grow h-screen overflow-y-scroll scrollbar-hide pb-24">
      <Header>
        <div className="flex flex-row">
          <Image
            src={category.icons[0].url}
            alt="Playlist Image Cover"
            width={200}
            height={200}
            className="rounded-lg mr-6 max-[400px]:w-24 max-[400px]:h-24 sm:w-[200px] sm:h-[200px] w-32 h-32"
          />
          <div className="flex flex-col justify-center mt-auto gap-1 sm:gap-4">
            <p className="text-sm hidden sm:block font-bold">Categories</p>
            <h1 className="mt-auto text-2xl lg:text-4xl font-bold line-clamp-2">
              {category.name}
            </h1>
          </div>
        </div>
      </Header>
      <div className="flex flex-row flex-wrap justify-center items-center mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 min-[720px]:grid-cols-2 grid-flow-row md:gap-12 gap-4">
          {data
            .filter((x) => x)
            .map((playlist) => (
              <Card
                key={playlist.id}
                image={
                  playlist.images[0].url ?? "https://via.placeholder.com/300"
                }
                title={playlist.name}
                description={playlist.description ?? ""}
                link={`${Pages.PLAYLIST}/${playlist.id}`}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const categoryId = context.query.id;
  const page = context.query.page;
  const token = await getToken({
    req: context.req,
    secret: process.env.SECRET,
  });
  spotifyApi.setAccessToken(token?.accessToken ?? "");
  try {
    const getCategory = await spotifyApi.getCategory(categoryId as string);
    const LIMIT = 10;

    const getcategoriesPlaylist = async (offset: number) => {
      spotifyApi.setAccessToken(token?.accessToken ?? "");

      const { body } = await spotifyApi.getPlaylistsForCategory(
        categoryId as string,
        { limit: LIMIT, offset: offset }
      );

      return body.playlists;
    };
    const results = await controlData(
      getcategoriesPlaylist,
      Number(page),
      true,
      LIMIT,
      categoryId as string,
      `${Pages.CATEGORIES}/${categoryId}`
    );
    if ((results as { props: { [key: string]: unknown } }).props) {
      return {
        props: {
          ...(results as { props: { [key: string]: unknown } }).props,
          category: getCategory.body,
        },
      };
    }
    return results;
  } catch (err) {
    return {
      notFound: true,
    };
  }
};
