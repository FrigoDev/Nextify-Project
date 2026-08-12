import shuffle from "lodash/shuffle";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const colors = [
  "from-indigo-500",
  "from-blue-500",
  "from-green-500",
  "from-yellow-500",
  "from-red-500",
  "from-pink-500",
  "from-purple-500",
];

const Header = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [color, setColor] = useState<string>();

  useEffect(() => {
    // Pick a deterministic color per pathname so SSR and client agree.
    const sum = router.pathname
      .split("")
      .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const idx = sum % colors.length;
    setColor(shuffle(colors).at(idx % colors.length));
  }, [router.pathname]);

  return (
    <header>
      <section
        className={`items-end space-x-7 bg-gradient-to-b to-[#121212] ${color} h-90 text-white max-[425px]:p-4 p-8`}
      >
        {children}
      </section>
    </header>
  );
};
export default Header;
