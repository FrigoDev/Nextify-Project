import { Router } from "next/router";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { Dispatch } from "@/store/store";

export default function useLoading() {
  const dispatch: Dispatch = useDispatch();
  useEffect(() => {
    const start = () => dispatch.loading.setLoading(true);
    const end = () => dispatch.loading.setLoading(false);
    Router.events.on("routeChangeStart", start);
    Router.events.on("routeChangeComplete", end);
    Router.events.on("routeChangeError", end);
    return () => {
      Router.events.off("routeChangeStart", start);
      Router.events.off("routeChangeComplete", end);
      Router.events.off("routeChangeError", end);
    };
  }, [dispatch]);
}
