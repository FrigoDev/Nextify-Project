import { GetServerSideProps } from "next";
import { getToken } from "next-auth/jwt";
import { AiOutlineSetting } from "react-icons/ai";

import Card from "@/components/Card";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SectionDivider from "@/components/SectionDivider";
import { Pages, Assets } from "@/constants/index";
import cachedHomeData, { HomeData } from "@/utils/fetchHomeData";
import welcomeMessage from "@/utils/welcomeMessage";

type indexProps = HomeData;

const Index = ({ topTracks, topArtists, playlists, savedAlbums }: indexProps) => {
  return (
    <div className="items-center pb-24 max-[450px]:pb-16">
      <Header>
        <div className="flex flex-col mt-10 max-[550px]:mt-4">
          <div className="flex flex-row justify-between mb-4 space-x-4">
            <h1 className="my-auto font-bold text-4xl max-[470px]:text-3xl">
              {welcomeMessage()}
            </h1>
            <AiOutlineSetting className="my-auto text-4xl max-[470px]:text-3xl hidden max-[550px]:block cursor-pointer hover:" />
          </div>
        </div>
      </Header>
      <SectionDivider name="Your Top Tracks">
        {topTracks.items.map((track) => (
          <Card
            key={track.id}
            image={track?.album?.images[0]?.url ?? Assets.DEFAULT_IMAGE}
            title={track.name}
            description={track.artists[0]?.name ?? ""}
            link={`${Pages.TRACKS}/${track.id}`}
          />
        ))}
      </SectionDivider>
      <SectionDivider name="Your Top Artists">
        {topArtists.items.map((artist) => (
          <Card
            key={artist.id}
            image={artist?.images[0]?.url ?? Assets.DEFAULT_IMAGE}
            title={artist.name}
            description={artist.genres?.slice(0, 2).join(", ") ?? ""}
            link={`${Pages.ARTIST}/${artist.id}`}
          />
        ))}
      </SectionDivider>
      <SectionDivider name="Your Playlists" url={Pages.LIBRARY}>
        {playlists.items.map((playlist) => (
          <Card
            key={playlist.id}
            image={playlist?.images?.[0]?.url ?? Assets.DEFAULT_IMAGE}
            title={playlist.name}
            description={playlist?.owner?.display_name ?? ""}
            link={`${Pages.PLAYLIST}/${playlist.id}`}
            contextUri={playlist.uri}
          />
        ))}
      </SectionDivider>
      <SectionDivider name="Saved Albums" url={Pages.LIBRARY}>
        {savedAlbums.items.map(({ album }) => (
          <Card
            key={album.id}
            image={album?.images[0]?.url ?? Assets.DEFAULT_IMAGE}
            title={album.name}
            description={album.artists[0]?.name ?? ""}
            link={`${Pages.ALBUM}/${album.id}`}
            contextUri={album.uri}
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

  const data = await cachedHomeData(token);
  return { props: data };
};

export default Index;
