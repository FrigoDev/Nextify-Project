import { Router } from "next/router";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Dispatch, RootState } from "@/store/store";

export default function useLoading() {
  const dispatch: Dispatch = useDispatch();
  const loading = useSelector((state: RootState) => state.loading);
  useEffect(() => {
    Router.events.on("routeChangeStart", () => {
      return !loading && dispatch.loading.setLoading(true);
    });
    Router.events.on("routeChangeComplete", () => {
      return loading && dispatch.loading.setLoading(false);
    });
  }, [loading, dispatch]);
}
