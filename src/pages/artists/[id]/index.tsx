import { GetServerSideProps } from "next";
import Image from "next/image";
import { getToken } from "next-auth/jwt";

import Card from "@/components/Card";
import Header from "@/components/Header";
import SectionDivider from "@/components/SectionDivider";
import Song from "@/components/Song";
import { Pages } from "@/constants";
import spotifyApi from "@/lib/spotifyWebApi";

interface ArtistPageProps {
  artist: SpotifyApi.ArtistObjectFull;
  topTracks: SpotifyApi.ArtistsTopTracksResponse;
  relatedArtists: SpotifyApi.ArtistsRelatedArtistsResponse;
  albums: SpotifyApi.ArtistsAlbumsResponse;
}

export default function ArtistPage({
  artist,
  topTracks,
  relatedArtists,
  albums,
}: ArtistPageProps) {
  return (
    <div className="flex-grow items-center h-screen overflow-y-scroll scrollbar-hide pb-24 max-[450px]:pb-16">
      <Header>
        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <Image
              src={artist.images[0].url}
              width={200}
              height={200}
              alt="Artist Image"
              className="rounded-full mb-2"
            />
            <h1 className="text-2xl font-bold">{artist.name}</h1>
          </div>
        </div>
      </Header>
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-white my-4">Top Tracks</h1>
        <div className="px-8 flex flex-col  pb-10 text-white">
          {topTracks.tracks.map((track, i) => (
            <Song key={track.id} track={track} order={i + 1} />
          ))}
        </div>
      </div>
      <SectionDivider name="Related Artists">
        {relatedArtists.artists.slice(0, 10).map((artist) => (
          <Card
            key={artist.id}
            title={artist.name}
            image={artist?.images[0]?.url ?? "https://via.placeholder.com/300"}
            link={`${Pages.ARTIST}/${artist.id}`}
            description=""
          ></Card>
        ))}
      </SectionDivider>
      <SectionDivider name="Albums" url={`${Pages.ARTIST}/${artist.id}/albums`}>
        {albums.items.map((album) => (
          <Card
            key={album.id}
            title={album.name}
            image={album?.images[0]?.url ?? "https://via.placeholder.com/300"}
            link={`${Pages.ALBUM}/${album.id}`}
            description=""
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
    const [{ body: topTracks }, { body: relatedArtists }, { body: albums }] =
      await Promise.all([
        spotifyApi.getArtistTopTracks(artistId as string, "US"),
        spotifyApi.getArtistRelatedArtists(artistId as string),
        spotifyApi.getArtistAlbums(artistId as string, { limit: 10 }),
      ]);

    return {
      props: {
        artist,
        topTracks,
        relatedArtists,
        albums,
      },
    };
  } catch (err) {
    console.log(err);
    return {
      notFound: true,
    };
  }
};
