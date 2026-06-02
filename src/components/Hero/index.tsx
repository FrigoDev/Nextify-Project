import Image from "next/image";
import { Fragment } from "react";

import Header from "@/components/Header";

const PLACEHOLDER = "https://via.placeholder.com/300";

interface HeroProps {
  image?: string;
  label: string;
  title: string;
  description?: string | null;
  meta?: React.ReactNode[];
}

export default function Hero({
  image,
  label,
  title,
  description,
  meta,
}: HeroProps) {
  const items = (meta ?? []).filter(Boolean);

  return (
    <Header>
      <div className="flex flex-row items-end gap-6 max-[450px]:gap-4">
        <Image
          src={image || PLACEHOLDER}
          alt={title}
          width={232}
          height={232}
          className="rounded-lg shadow-2xl max-[400px]:w-24 max-[400px]:h-24 sm:w-[200px] sm:h-[200px] w-32 h-32"
        />
        <div className="flex flex-col justify-end gap-3 min-w-0 pb-1">
          <p className="text-xs font-bold uppercase">{label}</p>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold leading-snug pb-4 line-clamp-2 break-words">
            {title}
          </h1>
          {description && (
            <p className="text-gray-300 text-sm line-clamp-2">{description}</p>
          )}
          {items.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-100">
              {items.map((item, i) => (
                <Fragment key={i}>
                  {i > 0 && <span className="text-gray-400">•</span>}
                  <span>{item}</span>
                </Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </Header>
  );
}
