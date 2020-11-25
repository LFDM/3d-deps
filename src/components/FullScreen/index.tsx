import { useState } from "react";

type Dimensions = {
  width: number;
  height: number;
};
export const FullScreen = ({
  children,
}: {
  children: ({ width, height }: Dimensions) => JSX.Element;
}) => {
  const [dimensions, setDimensions] = useState<Dimensions>({
    height: window.innerHeight,
    width: window.innerWidth,
  });
  return children(dimensions);
};
