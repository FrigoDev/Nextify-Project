import Image from "next/image";
import Link from "next/link";

interface CardProps {
  image: string;
  title: string;
  description: string;
  link: string;
}

const Card = ({ image, title, description, link }: CardProps) => {
  return (
    <div className="flex flex-col relative flex-shrink-0 p-4 cursor-pointer transition duration-500 ease-in-out bg-white bg-opacity-[.03] hover:bg-opacity-10 rounded-lg">
      <Image
        className="shadow-xl mb-4"
        src={image}
        width={150}
        height={150}
        alt={title}
      />
      <p className="text-white font-bold truncate w-[152px]">{title}</p>
      <p className="text-xs text-gray-400 break-words line-clamp-2 w-[152px]">
        {description}
      </p>
      <Link className="absolute top-0 left-0 h-full w-full" href={link} />
    </div>
  );
};
export default Card;
