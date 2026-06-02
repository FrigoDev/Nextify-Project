import Head from "next/head";
import { useRouter } from "next/router";

import NowPlaying from "../nowPlaying";
import Sidebar from "../Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  if (router.pathname === "/login") return <>{children}</>;
  return (
    <div className="bg-[#121212] h-screen overflow-hidden">
      <Head>
        <title>Nextify</title>
      </Head>
      <div className="flex">
        <Sidebar />
        {children}
      </div>
      <NowPlaying />
    </div>
  );
}
