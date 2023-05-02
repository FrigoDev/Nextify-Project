import { GetServerSidePropsResult } from "next";

const controlData = async <Type>(
  getData: (offset: number) => Promise<SpotifyApi.PagingObject<Type>>,
  page: number,
  pagination: boolean,
  LIMIT: number,
  id: string,
  route: string
): Promise<GetServerSidePropsResult<{ [key: string]: unknown }>> => {
  if (pagination && (!page || page < 1)) {
    return {
      redirect: {
        destination: `${route}?page=1`,
        permanent: false,
      },
    };
  }
  if (pagination) {
    return await isPaginated(page, LIMIT, getData, route, id);
  }
  return {
    notFound: true,
  };
};

const isPaginated = async <Type>(
  page: number,
  LIMIT: number,
  getData: (offset: number) => Promise<SpotifyApi.PagingObject<Type>>,
  route: string,
  id: string
): Promise<GetServerSidePropsResult<{ [key: string]: unknown }>> => {
  const offset = (page - 1) * LIMIT;

  const data = await getData(offset);
  const total = data.total;
  const totalPages = Math.ceil(total / LIMIT);
  if (page > totalPages) {
    return {
      redirect: {
        destination: `${route}?page=${totalPages}`,
        permanent: false,
      },
    };
  }
  return {
    props: {
      data: data.items,
      page: page,
      totalPages: totalPages,
      id: id,
    },
  };
};

export default controlData;
