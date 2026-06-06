import Image from "next/image";
import Link from "next/link";

const Custom404 = () => {
  return (
    <div className="flex flex-col justify-center align-middle w-full items-center">
      <Image
        priority
        width={200}
        height={200}
        src="/assets/images/SpotifyLogo.png"
        alt="Spotify logo"
        className="m-5"
      />
      <h1 className="text-white text-4xl my-2 font-bold">Page Not Found</h1>
      <p className="text-white mb-6 text-lg">
        We cannot find the page you are looking for.
      </p>
      <Link
        className="bg-[#1dd661] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#0f6f32] duration-700 ease-in-out"
        href="/"
      >
        Home
      </Link>
    </div>
  );
};
export default Custom404;
