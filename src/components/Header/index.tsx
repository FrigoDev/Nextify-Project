import { shuffle } from "lodash";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";

const colors = [
  "from-indigo-500",
  "from-blue-500",
  "from-green-500",
  "from-yellow-500",
  "from-red-500",
  "from-pink-500",
  "from-purple-500",
];

const   Header = ({children}:{children: React.ReactNode}) => {
  const { data: session } = useSession();
  const [color, setColor] = useState<string>();

  useEffect(() => {
    setColor(shuffle(colors).at(0));
  }, []);

  return (
    <header>
      <div className="absolute top-5 z-10 right-8 max-[550px]:hidden">
        <div className="flex items-center bg-black space-x-3 opacity-100 hover:opacity-90 cursor-pointer p-1 pr-2 rounded-full">
          <Image width={30} height={30} className="rounded-full" src={session?.user?.image ?? ""} alt="user profile image" />
          <h2 className="text-white font-bold sm:Display hidden md:inline-flex">{session?.user?.name}</h2>
          <FaChevronDown className="text-gray-300 h-5 w-5" />
        </div>
      </div>
      <section className={`flex-grow items-end space-x-7 bg-gradient-to-b to-[#121212] ${color} h-90 text-white max-[425px]:p-2 p-8`}>
        {
          children
        }
      </section>
    </header>
  );
};
export default Header;