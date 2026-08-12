import { GetServerSideProps } from "next";
import Image from "next/image";
import { getToken } from "next-auth/jwt";

import Card from "@/components/Card";
import Header from "@/components/Header";
import SectionDivider from "@/components/SectionDivider";
import { Assets, Pages } from "@/constants";
import spotifyApi from "@/lib/spotifyWebApi";

interface ArtistPageProps {
  artist: SpotifyApi.ArtistObjectFull;
  albums: SpotifyApi.ArtistsAlbumsResponse;
}

export default function ArtistPage({ artist, albums }: ArtistPageProps) {
  return (
    <div className="items-center pb-24 max-[450px]:pb-16">
      <Header>
        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <Image
              src={artist.images[0].url}
              width={200}
              height={200}
              sizes="200px"
              alt="Artist Image"
              className="rounded-full mb-2"
            />
            <h1 className="text-2xl font-bold">{artist.name}</h1>
          </div>
        </div>
      </Header>
      <SectionDivider name="Albums" url={`${Pages.ARTIST}/${artist.id}/albums`}>
        {albums.items.map((album) => (
          <Card
            key={album.id}
            title={album.name}
            image={album?.images[0]?.url ?? Assets.DEFAULT_IMAGE}
            link={`${Pages.ALBUM}/${album.id}`}
            description=""
            contextUri={album.uri}
          />
        ))}
      </SectionDivider>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const artistId = context.query.id;
  const token = await getToken({
    req: context.req,
    secret: process.env.SECRET,
  });
  if (!token || (token?.accessTokenExpires || 0) < Date.now()) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  try {
    spotifyApi.setAccessToken(token.accessToken ?? "");
    const { body: artist } = await spotifyApi.getArtist(artistId as string);
    const { body: albums } = await spotifyApi.getArtistAlbums(
      artistId as string,
      { limit: 10 }
    );

    return {
      props: {
        artist,
        albums,
      },
    };
  } catch {
    return {
      notFound: true,
    };
  }
};
