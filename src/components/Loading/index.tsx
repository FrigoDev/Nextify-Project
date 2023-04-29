import useLoading from "@/hooks/useLoading";

export default function Loading({ children }: { children: React.ReactNode }) {
  useLoading();
  return <>{children}</>;
}
