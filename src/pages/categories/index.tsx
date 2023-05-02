import { GetServerSideProps } from "next";
import { getToken } from "next-auth/jwt";

import Card from "@/components/Card";
import Pagination from "@/components/Pagination";
import { Pages } from "@/constants";
import spotifyApi from "@/lib/spotifyWebApi";

export default function FeaturedPlaylists({
  categories,
}: {
  categories: SpotifyApi.PagingObject<SpotifyApi.CategoryObject>;
}) {
  return (
    <div className="flex-grow h-screen overflow-y-scroll scrollbar-hide text-white pb-24">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl text-white font-bold my-4">Categories</h1>
        <div className="grid grid-cols-1 lg:grid-cols-4 min-[720px]:grid-cols-2 grid-flow-row md:gap-12 gap-4">
          {categories.items.map((category) => (
            <Card
              key={category.id}
              title={category.name}
              image={category.icons[0].url}
              description=""
              link={`${Pages.CATEGORIES}/${category.id}`}
            />
          ))}
        </div>
      </div>
      <Pagination
        total={categories.total}
        limit={12}
        url={Pages.RELEASES}
        page={Math.ceil(categories.offset / 12) + 1}
      />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { page } = context.query;
  if (!Number(page) || Number(page) < 1) {
    return {
      redirect: {
        destination: `${Pages.CATEGORIES}?page=1`,
        permanent: false,
      },
    };
  }
  const pageNumer = Number(page);
  const offset = (pageNumer - 1) * 10;
  const token = await getToken({
    req: context.req,
    secret: process.env.SECRET,
  });
  spotifyApi.setAccessToken(token?.accessToken ?? "");
  const categories = await spotifyApi.getCategories({ limit: 12, offset });
  if (categories.body.categories.total <= offset) {
    return {
      redirect: {
        destination: `${Pages.CATEGORIES}?page=${Math.ceil(
          categories.body.categories.total / 12
        )}`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      categories: categories.body.categories,
    },
  };
};
