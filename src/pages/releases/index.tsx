import { GetServerSideProps } from "next";
import { getToken } from "next-auth/jwt";

import Card from "@/components/Card";
import Pagination from "@/components/Pagination";
import { Pages } from "@/constants";
import spotifyApi from "@/lib/spotifyWebApi";

export default function Releases({
  releases,
}: {
  releases: SpotifyApi.PagingObject<SpotifyApi.AlbumObjectSimplified>;
}) {
  return (
    <div className="flex-grow h-screen overflow-y-scroll scrollbar-hide text-white pb-24">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl text-white font-bold my-4">New releases</h1>
        <div className="grid grid-cols-1 lg:grid-cols-4 min-[720px]:grid-cols-2 grid-flow-row md:gap-12 gap-4">
          {releases.items.map((release) => (
            <Card
              key={release.id}
              title={release.name}
              image={release.images[0].url}
              description={release.artists[0].name}
              link={`${Pages.ALBUM}/${release.id}`}
            />
          ))}
        </div>
      </div>
      <Pagination
        total={releases.total}
        limit={12}
        url={Pages.RELEASES}
        page={Math.ceil(releases.offset / 12) + 1}
      />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { page } = context.query;
  if (!Number(page) || Number(page) < 1) {
    return {
      redirect: {
        destination: "/releases?page=1",
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
  const releases = await spotifyApi.getNewReleases({ limit: 12, offset });
  if (releases.body.albums.total <= offset) {
    return {
      redirect: {
        destination: `/releases?page=${Math.ceil(
          releases.body.albums.total / 12
        )}`,
        permanent: false,
      },
    };
  }
  return {
    props: {
      releases: releases.body.albums,
    },
  };
};
