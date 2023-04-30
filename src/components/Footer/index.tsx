import Link from "next/link";

const Footer = () => {
  return (
    <footer className="max-[425px]:p-2 p-8">
      <hr className="border-t-[0.1]px border-gray-400"/>
      <div className="flex flex-row justify-between gap-4 mt-8">
        <nav className="flex flex-row gap-4">
          <Link className="text-gray-400 text-sm hover:text-white" href="https://www.spotify.com/co-en/legal/end-user-agreement/">Legal</Link>
          <Link className="text-gray-400 text-sm hover:text-white" href="https://www.spotify.com/co-en/privacy">Privacy Center</Link>
          <Link className="text-gray-400 text-sm hover:text-white" href="https://www.spotify.com/co-en/legal/privacy-policy/">Privacy Policy</Link>
          <Link className="text-gray-400 text-sm hover:text-white" href="https://www.spotify.com/co-en/legal/cookies-policy/">Cookies</Link>
          <Link className="text-gray-400 text-sm hover:text-white" href="https://www.spotify.com/co-en/legal/privacy-policy/#s3">About Ads</Link>
        </nav>
        <p className="text-gray-400 text-sm pr-4">© 2023 Spotify AB</p>
      </div>
    </footer>
  );
};
export default Footer;