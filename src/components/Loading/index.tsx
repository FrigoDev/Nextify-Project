import { useSelector } from "react-redux";

import useLoading from "@/hooks/useLoading";
import { RootState } from "@/store/store";

export default function Loading({ children }: { children: React.ReactNode }) {
  useLoading();
  const loading = useSelector((state: RootState) => state.loading);

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 z-50 h-1 w-full overflow-hidden">
          <div className="h-full w-1/3 rounded-r-full bg-green-500 animate-[loading-bar_0.9s_linear_infinite]" />
        </div>
      )}
      {children}
    </>
  );
}
