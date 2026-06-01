import { shuffle } from "lodash";
import Image from "next/image";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";

import Dropdown from "../Dropdown";

const colors = [
  "from-indigo-500",
  "from-blue-500",
  "from-green-500",
  "from-yellow-500",
  "from-red-500",
  "from-pink-500",
  "from-purple-500",
];

const options = [
  { id: 1, name: "Profile" },
  { id: 2, name: "Log out" },
];

const Header = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [color, setColor] = useState<string>();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setColor(shuffle(colors).at(0));
  }, []);

  const handleSwitch = () => {
    setIsOpen(!isOpen);
  };
  return (
    <>
      <header>
        <Dropdown
          isOpen={isOpen}
          onClose={handleSwitch}
          options={options.map((option) => ({
            value: option.id.toString(),
            label: option.name,
          }))}
          onSelect={(value) => {
            if (value.value === "1") {
              router.push("/user");
            } else {
              signOut();
            }
          }}
        >
          <div className="absolute top-5 z-10 right-8 max-[550px]:hidden">
            <div
              onClick={handleSwitch}
              className="flex items-center bg-black space-x-3 opacity-100 hover:opacity-90 cursor-pointer p-1 pr-2 rounded-full"
            >
              <Image
                width={30}
                height={30}
                className="rounded-full"
                src={session?.user?.image ?? ""}
                alt="user profile image"
              />
              <h2 className="text-white font-bold sm:Display hidden md:inline-flex">
                {session?.user?.name}
              </h2>
              <FaChevronDown className="text-gray-300 h-5 w-5" />
            </div>
          </div>
        </Dropdown>
        <section
          className={`items-end space-x-7 bg-gradient-to-b to-[#121212] ${color} h-90 text-white max-[425px]:p-4 p-8`}
        >
          {children}
        </section>
      </header>
    </>
  );
};
export default Header;
