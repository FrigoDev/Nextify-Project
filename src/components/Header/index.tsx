import { shuffle } from "lodash";
import { useState, useEffect } from "react";

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
  const [color, setColor] = useState<string>();

  useEffect(() => {
    setColor(shuffle(colors).at(0));
  }, []);

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
