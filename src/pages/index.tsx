import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { getToken } from "next-auth/jwt";
import { AiOutlineSetting } from "react-icons/ai";
import { FaPlay } from "react-icons/fa";
import { useDispatch } from "react-redux";

import Card from "@/components/Card";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SectionDivider from "@/components/SectionDivider";
import { Pages, Assets } from "@/constants/index";
import spotifyApi from "@/lib/spotifyWebApi";
import { Dispatch } from "@/store/store";
import welcomeMessage from "@/utils/welcomeMessage";

interface indexProps {
  topTracks: SpotifyApi.PagingObject<SpotifyApi.TrackObjectFull>;
  releases: SpotifyApi.PagingObject<SpotifyApi.AlbumObjectSimplified>;
  featuredPlaylists: SpotifyApi.PagingObject<SpotifyApi.PlaylistObjectSimplified>;
  categories: SpotifyApi.PagingObject<SpotifyApi.CategoryObject>;
}

const Index = ({
  topTracks,
  releases,
  featuredPlaylists,
  categories,
}: indexProps) => {
  const dispatch = useDispatch<Dispatch>();
  return (
    <div className="items-center h-screen overflow-y-scroll scrollbar-hide pb-24 max-[450px]:pb-16">
      <Header>
        <div className="flex flex-col mt-10 max-[550px]:mt-4">
          <div className="flex flex-row justify-between mb-4 space-x-4">
            <h1 className="my-auto font-bold text-4xl max-[470px]:text-3xl">
              {welcomeMessage()}
            </h1>
            <AiOutlineSetting className="my-auto text-4xl max-[470px]:text-3xl hidden max-[550px]:block cursor-pointer hover:" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 min-[720px]:grid-cols-2 grid-flow-row md:gap-4 gap-2">
            {topTracks.items.map((track) => (
              <>
                <div className="flex flex-row my-2 ml-2 pr-2 cursor-pointer transition duration-500 ease-in-out bg-white bg-opacity-10 hover:bg-opacity-25 rounded-lg">
                  <Link
                    className="flex flex-row w-full"
                    href={`${Pages.TRACKS}/${track.id}`}
                    key={track.id}
                  >
                    <Image
                      src={track?.album?.images[0]?.url ?? Assets.DEFAULT_IMAGE}
                      width={80}
                      height={80}
                      alt={track.name}
                      className="rounded-lg drop-shadow-xl"
                    />
                    <p className="text-md my-auto ml-4 break-words line-clamp-2">
                      {track.name}
                    </p>
                  </Link>
                  <button
                    onClick={() => {
                      dispatch.playingSong.playTrack(track);
                    }}
                    className="flex justify-end my-auto mr-2 text-black bg-green-500 rounded-full min-w-[32px] h-8 duration-300 hover:scale-110 hover:bg-green-400"
                  >
                    <FaPlay className="text-center m-auto pl-1" />
                  </button>
                </div>
              </>
            ))}
          </div>
        </div>
      </Header>
      <SectionDivider name="New Releases" url={Pages.RELEASES}>
        {releases.items.map((release) => (
          <Card
            key={release.id}
            image={release?.images[0]?.url ?? Assets.DEFAULT_IMAGE}
            title={release.name}
            description={release.artists[0].name}
            link={`${Pages.ALBUM}/${release.id}`}
          />
        ))}
      </SectionDivider>
      <SectionDivider name="Featured Playlists" url={Pages.FEATURED_PLAYLIST}>
        {featuredPlaylists.items.map((playlist) => (
          <Card
            key={playlist.id}
            image={playlist?.images[0]?.url ?? Assets.DEFAULT_IMAGE}
            title={playlist.name}
            description={playlist?.description ?? ""}
            link={`${Pages.PLAYLIST}/${playlist.id}`}
          />
        ))}
      </SectionDivider>
      <SectionDivider name="Categories" url={Pages.CATEGORIES}>
        {categories.items.map((category) => (
          <Card
            key={category.id}
            image={category?.icons[0]?.url ?? Assets.DEFAULT_IMAGE}
            title={category.name}
            description={""}
            link={`${Pages.CATEGORIES}/${category.id}`}
          />
        ))}
      </SectionDivider>
      <Footer />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = await getToken({
    req: context.req,
    secret: process.env.SECRET,
  });
  if (!token || !token.accessToken) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  await spotifyApi.setAccessToken(token.accessToken);

  const [topTracks, newReleasesData, featuredPlaylistsData, categories] =
    await Promise.all([
      spotifyApi.getMyTopTracks({ limit: 6, time_range: "short_term" }),
      spotifyApi.getNewReleases({ limit: 10, country: "CO" }),
      spotifyApi.getFeaturedPlaylists({ limit: 10, country: "CO" }),
      spotifyApi.getCategories({ limit: 10, country: "CO" }),
    ]);
  return {
    props: {
      topTracks: topTracks.body,
      releases: newReleasesData.body.albums,
      featuredPlaylists: featuredPlaylistsData.body.playlists,
      categories: categories.body.categories,
    },
  };
};

export default Index;
