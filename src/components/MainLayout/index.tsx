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
      <div className="fixed max-[450px]:bottom-[65px] bottom-0 w-full bg-[#121212] border-t border-gray-900 text-white">
        <NowPlaying />
      </div>
    </div>
  );
}
