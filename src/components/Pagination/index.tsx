import router from "next/router";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const Pagination = ({
  total,
  limit,
  page,
  url,
  queryParams,
}: {
  total: number;
  limit: number;
  page: number;
  url: string;
  queryParams?: { [key: string]: string };
}) => {
  return (
    <div className="flex justify-center items-center my-4">
      {page > 1 && (
        <button
          className="bg-green-500 hover:bg-green-700 text-sm text-white font-bold py-4 px-4 mx-2 rounded-full"
          onClick={() => {
            router.push({
              pathname: url,
              query: {
                ...queryParams,
                page: page - 1,
              },
            });
          }}
        >
          <FaArrowLeft />
        </button>
      )}
      {page > 1 && (
        <button
          className="bg-green-500 hover:bg-green-700 text-sm inline-flex items-center justify-center h-12 w-12 text-white font-bold py-4 px-4 mx-2 rounded-full"
          onClick={() => {
            router.push({
              pathname: url,
              query: {
                ...queryParams,
                page: page - 1,
              },
            });
          }}
        >
          {page - 1}
        </button>
      )}
      <button
        className="bg-green-500 hover:bg-green-700 inline-flex items-center justify-center h-12 w-12 text-white font-bold py-4 px-4 mx-2 rounded-full"
        disabled={page >= Math.ceil(total / limit)}
      >
        {page}
      </button>
      {page + 1 < Math.ceil(total / limit) && (
        <button
          className="bg-green-500 hover:bg-green-700 inline-flex items-center justify-center h-12 w-12 text-white font-bold py-4 px-4 mx-2 rounded-full"
          disabled={page >= Math.ceil(total / limit)}
          onClick={() => {
            router.push({
              pathname: url,
              query: {
                ...queryParams,
                page: page + 1,
              },
            });
          }}
        >
          {page + 1}
        </button>
      )}
      {page + 1 < Math.ceil(total / limit) && (
        <button
          className="bg-green-500 hover:bg-green-700 text-sm text-white font-bold py-4 px-4 mx-2 rounded-full"
          disabled={page >= Math.ceil(total / limit)}
          onClick={() => {
            router.push({
              pathname: url,
              query: {
                ...queryParams,
                page: page + 1,
              },
            });
          }}
        >
          <FaArrowRight />
        </button>
      )}
    </div>
  );
};
export default Pagination;
