import Head from "next/head";
import { useRouter } from "next/router";

import NowPlaying from "../nowPlaying";
import Sidebar from "../Sidebar";
import TopBar from "../TopBar";

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
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <TopBar />
          <main className="flex-1 overflow-y-auto scrollbar-hide">
            {children}
          </main>
        </div>
      </div>
      <NowPlaying />
    </div>
  );
}
