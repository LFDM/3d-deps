import { useEffect, useRef, useState } from "react";

export const usePrevious = <T>(value: T) => {
  const ref = useRef<T>();
  useEffect(() => void (ref.current = value), [value]);
  return ref.current;
};

export const useMeasure = () => {
  const ref = useRef();
  const [bounds, set] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const [ro] = useState(
    // @ts-ignore
    () => new ResizeObserver(([entry]) => set(entry.contentRect))
  );
  useEffect(() => {
    if (ref.current) ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [{ ref }, bounds];
};
