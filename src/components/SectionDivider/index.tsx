import Link from "next/link";

const SectionDivider = ({
  name,
  children,
  url,
}: {
  name: string;
  children: React.ReactNode;
  url?: string;
}) => {
  return (
    <section className="flex flex-col">
      <div className="flex flex-row justify-between max-[425px]:p-4 p-8">
        {url ? (
          <Link href={url}>
            <h2 className="text-white font-bold text-2xl hover:underline cursor-pointer">
              {name}
            </h2>
          </Link>
        ) : (
          <h2 className="text-white font-bold text-2xl">{name}</h2>
        )}
        <div className="flex flex-row">
          {url ? (
            <Link
              className="flex flex-col justify-end text-gray-400 font-bold text-lg hover:underline cursor-pointer align-bottom"
              href={url}
            >
              Show all
            </Link>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div className="flex flex-row flex-nowrap gap-6 overflow-x-scroll scrollbar-hide max-[425px]:px-2 px-8">
        {children}
      </div>
    </section>
  );
};
export default SectionDivider;
