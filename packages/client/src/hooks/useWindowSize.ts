import { useLayoutEffect, useState } from "react";

type Dimensions = {
  width: number;
  height: number;
};

export const useWindowSize = (): Dimensions => {
  const [windowSize, setWindowSize] = useState<Dimensions>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useLayoutEffect(() => {
    const handleResize = () => {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};
