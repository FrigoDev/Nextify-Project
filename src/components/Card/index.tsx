import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback } from "react";
import { FaPlay } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

import { activatePlayer } from "@/lib/spotifyPlayerInstance";
import { Dispatch, RootState } from "@/store/store";

interface CardProps {
  image: string;
  title: string;
  description: string;
  link: string;
  contextUri?: string;
}

const Card = ({ image, title, description, link, contextUri }: CardProps) => {
  const dispatch = useDispatch<Dispatch>();
  const { data: session } = useSession();
  const deviceId = useSelector((state: RootState) => state.playingSong.deviceId);

  const play = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      activatePlayer();
      if (!contextUri || !deviceId || !session?.accessToken) return;
      dispatch.playingSong.playContext({
        access_token: session.accessToken,
        deviceId,
        contextUri,
      });
    },
    [contextUri, deviceId, session?.accessToken, dispatch]
  );

  return (
    <div className="group flex flex-col relative flex-shrink-0 p-4 cursor-pointer transition duration-500 ease-in-out bg-white bg-opacity-[.03] hover:bg-opacity-10 rounded-lg">
      <div className="relative mb-4">
        <Image
          className="shadow-xl"
          src={image}
          width={150}
          height={150}
          sizes="(max-width: 768px) 50vw, 152px"
          alt={title}
        />
        {contextUri && deviceId && (
          <button
            onClick={play}
            aria-label={`Play ${title}`}
            className="absolute bottom-2 right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-black opacity-0 translate-y-2 shadow-lg transition duration-300 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105"
          >
            <FaPlay className="h-4 w-4 pl-0.5" />
          </button>
        )}
      </div>
      <p className="text-white font-bold truncate w-[152px]">{title}</p>
      <p className="text-xs text-gray-400 break-words line-clamp-2 w-[152px]">
        {description}
      </p>
      <Link className="absolute top-0 left-0 h-full w-full" href={link} />
    </div>
  );
};
export default Card;
