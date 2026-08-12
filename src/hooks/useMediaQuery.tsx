import { useEffect, useState } from "react";

function useMediaQuery(query: string): boolean {
  const getMatches = (q: string): boolean => {
    if (typeof window !== "undefined") {
      return window.matchMedia(q).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(getMatches(query));

  useEffect(() => {
    const matchMedia = window.matchMedia(query);
    const handleChange = () => setMatches(getMatches(query));
    handleChange();

    if (matchMedia.addEventListener) {
      matchMedia.addEventListener("change", handleChange);
    } else {
      // Fallback for older browsers.
      matchMedia.addListener(handleChange);
    }

    return () => {
      if (matchMedia.removeEventListener) {
        matchMedia.removeEventListener("change", handleChange);
      } else {
        matchMedia.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
}

export default useMediaQuery;
